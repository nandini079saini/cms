const crypto = require("crypto");
const { optimizeGifBuffer } = require("./gifOptimizer");

// Env vars are read inside the functions (not at module load time) so this
// file works no matter when/where it's required relative to dotenv.config().
function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function pushBufferToGithub(buffer, folder, filename, commitMessage) {
  const { token, owner, repo, branch } = githubConfig();
  const path = `${folder}/${filename}`;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage || `Add ${filename}`,
        content: buffer.toString("base64"),
        branch,
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "GitHub upload failed");
  }
  return { url: data.content.download_url, path };
}

async function pushSnapToGithub(buffer, filename) {
  return pushBufferToGithub(buffer, "snaps", filename, `Add snap ${filename}`);
}

// Downloads whatever GIF url was pasted, shrinks it, re-hosts the shrunk
// version on our own GitHub repo, and returns the new hosted url. Falls
// back to the original url if anything fails, so a bad/slow source link
// never blocks saving a post.
async function processGifUrl(rawUrl) {
  const url = (rawUrl || "").trim();
  if (!url) return null;

  const { owner, repo } = githubConfig();
  const ownHost = `raw.githubusercontent.com/${owner}/${repo}`;
  if (url.includes(ownHost)) return url; // already ours, don't reprocess

  try {
    const sourceRes = await fetch(url);
    if (!sourceRes.ok) throw new Error(`Fetch failed: ${sourceRes.status}`);

    const contentType = sourceRes.headers.get("content-type") || "";
    if (!contentType.includes("gif") && !url.toLowerCase().endsWith(".gif")) {
      return url; // not actually a gif, nothing to optimize
    }

    const arrayBuffer = await sourceRes.arrayBuffer();
    const sourceBuffer = Buffer.from(arrayBuffer);
    const optimizedBuffer = await optimizeGifBuffer(sourceBuffer);

    const filename = `${Date.now()}-${crypto.randomUUID()}.gif`;
    const { url: hostedUrl } = await pushBufferToGithub(
      optimizedBuffer,
      "gifs",
      filename,
      `Add optimized gif ${filename}`,
    );

    return hostedUrl;
  } catch (err) {
    console.error("GIF optimization failed, using original url:", err.message);
    return url;
  }
}

module.exports = { pushBufferToGithub, pushSnapToGithub, processGifUrl };
