// Upload prerender/<channel>/*.mp4 (+ .jpg posters) to Vercel Blob and write content/manifest.json.
// Sample mode: channels with no clips of their own borrow from the Chaos pool (marked sample: true).
// Usage: node scripts/upload.mjs   (needs BLOB_READ_WRITE_TOKEN in .env.local)
import { put, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
for (const line of readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const spec = JSON.parse(readFileSync(path.join(ROOT, "content/channels.json"), "utf8"));
const cachePath = path.join(ROOT, ".blob-cache.json");
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};

const existing = new Map();
for await (const page of listAll()) for (const b of page) existing.set(b.pathname, b.url);
async function* listAll() {
  let cursor;
  do {
    const res = await list({ cursor, limit: 1000 });
    yield res.blobs;
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
}

async function upload(localPath, blobPath) {
  if (cache[blobPath]) return cache[blobPath];
  if (existing.has(blobPath)) return (cache[blobPath] = existing.get(blobPath));
  const res = await put(blobPath, readFileSync(localPath), { access: "public", addRandomSuffix: false, contentType: blobPath.endsWith(".mp4") ? "video/mp4" : "image/jpeg" });
  cache[blobPath] = res.url;
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  console.log("uploaded", blobPath);
  return res.url;
}
function duration(p) {
  return parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`).toString().trim());
}

const clips = {};
const localPools = {};
for (const ch of spec.channels) {
  const dir = path.join(ROOT, "prerender", ch.id);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort();
  localPools[ch.id] = [];
  for (const f of files) {
    const id = `${ch.id}/${f.replace(".mp4", "")}`;
    const mp4 = path.join(dir, f), jpg = mp4.replace(".mp4", ".jpg");
    clips[id] = { id, url: await upload(mp4, `clips/${id}.mp4`), poster: existsSync(jpg) ? await upload(jpg, `clips/${id}.jpg`) : "", duration: duration(mp4) };
    localPools[ch.id].push(id);
  }
}

const chaosPool = localPools.chaos ?? [];
const channels = spec.channels.map((ch, ci) => {
  const own = localPools[ch.id] ?? [];
  const isReal = own.length >= 20;
  let k = 0;
  const rounds = ch.rounds.map((rd, ri) => ({
    beat: rd.beat,
    options: rd.options.map((o, oi) => {
      let clipId;
      if (isReal) clipId = `${ch.id}/r${ri + 1}${"ABCD"[oi]}`;
      else if (own.length) clipId = own[k++ % own.length];
      else clipId = chaosPool[(k++ * 5 + ci * 3) % chaosPool.length];
      if (!isReal) clips[clipId].sample = true;
      return { label: o.label, clipId };
    }),
  }));
  return { id: ch.id, name: ch.name, tagline: ch.tagline, adult: ch.adult, system: ch.system, rounds };
});

writeFileSync(path.join(ROOT, "content/manifest.json"), JSON.stringify({ generated: new Date().toISOString(), clips, channels }, null, 2));
console.log(`manifest: ${Object.keys(clips).length} clips, ${channels.length} channels`);
