"""Pre-render every candidate clip in content/channels.json on Venice (H3 Max).

Usage:
  python3 scripts/prerender.py --dry-run                # total quote, nothing spent
  python3 scripts/prerender.py --channels chaos,sitcom  # render some channels
  python3 scripts/prerender.py                          # render everything missing

Resumable: a clip whose mp4 exists is skipped. Output: prerender/<channel>/r<round><A-D>.mp4 + .jpg
Then run `node scripts/upload.mjs` to push to Vercel Blob and write content/manifest.json.
"""
import sys, os, re, json, time, base64, argparse, subprocess, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = re.search(r'^VENICE_API_KEY=(.+)$', open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(), re.M).group(1).strip('"')
H = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
API = "https://api.venice.ai/api/v1"
LETTERS = "ABCD"

def call(path, body, timeout=180):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(), headers=H)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        data = r.read(); ct = r.headers.get("Content-Type", "")
        if "json" in ct: return json.loads(data)
        return {"_binary": data, "_ct": ct}
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read()[:400].decode(errors="replace")}

def b64(p):
    return "data:image/png;base64," + base64.b64encode(open(p, 'rb').read()).decode()

def render_one(job):
    ch, ri, oi, opt, clip, out = job
    body = {"model": ch["model"], "prompt": f'{opt["prompt"]} {ch["style"]}', "duration": clip["duration"], "resolution": clip["resolution"]}
    if ch["model"].endswith("reference-to-video"):
        body["reference_image_urls"] = [b64(os.path.join(ROOT, ch["reference"]))]
        body["aspect_ratio"] = clip["aspect_ratio"]
    elif ch["model"].endswith("text-to-video"):
        body["aspect_ratio"] = clip["aspect_ratio"]
    t0 = time.time()
    q = call("/video/queue", body)
    if "_error" in q: return (out, f"queue error {q['_error']} {q['_body']}")
    qid = q.get("queue_id")
    while True:
        time.sleep(5)
        s = call("/video/retrieve", {"queue_id": qid, "model": ch["model"]})
        if "_error" in s: return (out, f"retrieve error {s['_error']} {s['_body']}")
        if s.get("_binary"):
            open(out, "wb").write(s["_binary"]); break
        if s.get("download_url"):
            urllib.request.urlretrieve(s["download_url"], out); break
        st = (s.get("status") or "").upper()
        if st in ("FAILED", "ERROR", "CANCELLED"): return (out, f"FAILED {json.dumps(s)[:300]}")
        if time.time() - t0 > 600: return (out, "timeout")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", out, "-frames:v", "1", "-q:v", "3", "-update", "1", out[:-4] + ".jpg"])
    return (out, f"ok {time.time()-t0:.0f}s {os.path.getsize(out)//1024}KB")

def main():
    a = argparse.ArgumentParser(); a.add_argument("--dry-run", action="store_true"); a.add_argument("--channels"); a.add_argument("--workers", type=int, default=6); o = a.parse_args()
    spec = json.load(open(os.path.join(ROOT, "content", "channels.json"))); clip = spec["clip"]
    want = set(o.channels.split(",")) if o.channels else None
    jobs, total = [], 0.0
    for ch in spec["channels"]:
        if want and ch["id"] not in want: continue
        d = os.path.join(ROOT, "prerender", ch["id"]); os.makedirs(d, exist_ok=True)
        qb = {"model": ch["model"], "duration": clip["duration"], "resolution": clip["resolution"], "prompt": "x"}
        price = call("/video/quote", qb).get("quote", 0)
        for ri, rd in enumerate(ch["rounds"]):
            for oi, opt in enumerate(rd["options"]):
                out = os.path.join(d, f"r{ri+1}{LETTERS[oi]}.mp4")
                if os.path.exists(out): continue
                jobs.append((ch, ri, oi, opt, clip, out)); total += price
    print(f"{len(jobs)} clips to render, quoted total ${total:.2f}")
    if o.dry_run or not jobs: return
    with ThreadPoolExecutor(max_workers=o.workers) as ex:
        futs = [ex.submit(render_one, j) for j in jobs]
        for f in as_completed(futs):
            out, msg = f.result(); print(os.path.relpath(out, ROOT), msg, flush=True)

if __name__ == "__main__": main()
