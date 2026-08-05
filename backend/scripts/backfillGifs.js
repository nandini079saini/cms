require("dotenv").config();
const db = require("../db");
const { processGifUrl } = require("../utils/githubGif");

// Small delay between GitHub pushes so we don't slam the API on a big table.
const DELAY_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function backfillTable(table, idCol = "id") {
  const [rows] = await db.query(
    `SELECT ${idCol} AS id, gif_url FROM ${table} WHERE gif_url IS NOT NULL AND gif_url != ''`,
  );

  console.log(`\n${table}: ${rows.length} row(s) with a gif_url to check`);

  let optimized = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const newUrl = await processGifUrl(row.gif_url);

      if (newUrl && newUrl !== row.gif_url) {
        await db.query(`UPDATE ${table} SET gif_url = ? WHERE ${idCol} = ?`, [
          newUrl,
          row.id,
        ]);
        optimized++;
        console.log(`  [ok] id=${row.id} -> ${newUrl}`);
      } else {
        skipped++;
        console.log(`  [skip] id=${row.id} (already optimized or not a gif)`);
      }
    } catch (err) {
      failed++;
      console.error(`  [fail] id=${row.id}:`, err.message);
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `${table} done — optimized: ${optimized}, skipped: ${skipped}, failed: ${failed}`,
  );
}

async function main() {
  console.log("Starting GIF backfill...");
  await backfillTable("posts");
  await backfillTable("quick_bites");
  console.log("\nAll done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill script crashed:", err);
  process.exit(1);
});
