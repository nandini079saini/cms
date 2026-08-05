const gifsicleModule = require("gifsicle"); // npm install gifsicle
// Newer versions of the gifsicle package are ESM-only. When required via
// CommonJS, Node wraps the module in a namespace object instead of handing
// back the plain binary path string — unwrap .default if that happened.
const gifsicle = gifsicleModule?.default || gifsicleModule;
if (typeof gifsicle !== "string") {
  throw new Error(
    "Could not resolve the gifsicle binary path from the 'gifsicle' package — " +
      "got: " +
      JSON.stringify(gifsicle),
  );
}
const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

/**
 * Runs a GIF buffer through gifsicle to shrink it:
 *  - resizes down to maxWidth (keeps aspect ratio)
 *  - reduces the color palette (fewer colors = much smaller file)
 *  - applies lossy compression (gifsicle's own algorithm, safe defaults)
 *
 * Frame-rate is NOT dropped here on purpose — thinning frames means
 * recalculating per-frame delays too, and doing that wrong makes GIFs play
 * back at the wrong speed. Resize + colors + lossy alone typically cut
 * file size by 60-90% with no visible quality hit, which is the actual
 * bottleneck for load time. Ping me if you also want frame-thinning and
 * I'll add it properly with delay correction.
 */
async function optimizeGifBuffer(
  buffer,
  { maxWidth = 480, colors = 64, lossy = 80 } = {},
) {
  const tmpDir = os.tmpdir();
  const token = crypto.randomBytes(6).toString("hex");
  const inPath = path.join(tmpDir, `gif_in_${token}.gif`);
  const outPath = path.join(tmpDir, `gif_out_${token}.gif`);

  await fs.writeFile(inPath, buffer);

  const args = [
    `--resize-width=${maxWidth}`,
    `--colors=${colors}`,
    `--lossy=${lossy}`,
    "--optimize=3",
    "-o",
    outPath,
    inPath,
  ];

  try {
    await new Promise((resolve, reject) => {
      execFile(gifsicle, args, (err, _stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve();
      });
    });

    const optimized = await fs.readFile(outPath);
    return optimized;
  } finally {
    // best-effort cleanup, don't let this throw
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

module.exports = { optimizeGifBuffer };
