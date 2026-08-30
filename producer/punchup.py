"""Punch-up: rewrite each segment's script in Doge meme mood via a Venice uncensored model. Facts, order and length stay; only the voice changes.
Usage: python producer/punchup.py producer/rundown-2026-08-30.json [model]"""
import json,sys,os,re,urllib.request,time
KEY=re.search(r'^VENICE_API_KEY=(.+)$',open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(),re.M).group(1).strip('"')
MODEL=sys.argv[2] if len(sys.argv)>2 else "venice-uncensored-1-2"
RULES="""You punch up news scripts for Doge, the Shiba Inu anchor of The Doge Show, a live crypto and AI news channel.
Rewrite the line so it sounds like Doge: clear, simple, fast, confident news delivery with a meme-funny edge. Doge-speak sparingly
("much", "very", "such", "wow", treats, paws, bonk, hodl) as punchlines, mostly at the end of a beat, never inside the facts.
Hard rules: keep EVERY fact, name, number and attribution exactly; keep the same order; keep length within +-15% of the original word count;
spoken English only; no emojis, no hashtags, no markdown; NEVER use an em dash or a double hyphen, use commas and full stops instead;
numbers written the way an anchor would say them. Output ONLY the rewritten line."""
def ask(text):
    body={"model":MODEL,"temperature":0.9,"max_tokens":400,"messages":[{"role":"system","content":RULES},{"role":"user","content":text}]}
    for attempt in range(3):
        try:
            req=urllib.request.Request("https://api.venice.ai/api/v1/chat/completions",data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"})
            r=json.load(urllib.request.urlopen(req,timeout=90)); out=r["choices"][0]["message"]["content"].strip().strip('"')
            return out.replace("—",",").replace("--",",").replace(" ,",",")
        except Exception as e: print("  retry",attempt,e); time.sleep(3)
    return text
p=sys.argv[1]; rd=json.load(open(p))
for s in rd["segments"]:
    if not s.get("script"): continue
    s.setdefault("script_v1",s["script"]); new=ask(s["script_v1"])
    print(f"[{s['id']}] {len(s['script_v1'].split())}w -> {len(new.split())}w\n   {new}\n")
    s["script"]=new
json.dump(rd,open(p,"w"),indent=1,ensure_ascii=False); print("saved",p,"model",MODEL)
