"""Venice music / SFX helper. Usage: python studio/audio.py <out.mp3> "<prompt>" [--model minimax-music-v26|elevenlabs-sound-effects-v2] [--seconds 30] [--instrumental] [--quote-only]"""
import sys,json,re,os,time,urllib.request,argparse
KEY=re.search(r'^VENICE_API_KEY=(.+)$',open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(),re.M).group(1).strip('"')
H={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"}
def call(path,body):
    req=urllib.request.Request("https://api.venice.ai/api/v1"+path,data=json.dumps(body).encode(),headers=H)
    try:
        r=urllib.request.urlopen(req,timeout=180); data=r.read(); ct=r.headers.get("Content-Type","")
        return json.loads(data) if "json" in ct else {"_binary":data,"_ct":ct}
    except urllib.error.HTTPError as e: print("ERR",path,e.code,e.read()[:500]); sys.exit(1)
a=argparse.ArgumentParser(); a.add_argument("out"); a.add_argument("prompt"); a.add_argument("--model",default="minimax-music-v26"); a.add_argument("--seconds",type=int,default=None); a.add_argument("--instrumental",action="store_true"); a.add_argument("--quote-only",action="store_true")
o=a.parse_args(); body={"model":o.model,"prompt":o.prompt}
if o.seconds: body["duration_seconds"]=o.seconds
if o.instrumental: body["force_instrumental"]=True
def quote(b):
    for keys in (("model","duration_seconds"),("model",)):
        req=urllib.request.Request("https://api.venice.ai/api/v1/audio/quote",data=json.dumps({k:b[k] for k in keys if k in b}).encode(),headers=H)
        try: return json.load(urllib.request.urlopen(req,timeout=60))
        except urllib.error.HTTPError as e: last=e.read()[:200]
    return {"error":last.decode()}
print("quote",quote(body))
if o.quote_only: sys.exit()
r=call("/audio/queue",body); qid=r["queue_id"]; print("queued",qid); t0=time.time()
while True:
    time.sleep(4); s=call("/audio/retrieve",{"queue_id":qid,"model":o.model})
    if s.get("_binary"): open(o.out,"wb").write(s["_binary"]); print("done",o.out,s["_ct"],f"{time.time()-t0:.0f}s",len(s["_binary"]),"bytes"); break
    if str(s.get("status","")).upper() in ("FAILED","ERROR"): print("FAILED",s); sys.exit(1)
