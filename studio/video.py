"""Venice video helper.
Usage: python studio/video.py <out.mp4> "<prompt>" [--image in.png] [--end-image in.png] [--model M] [--duration 5s] [--resolution 1080p] [--negative "..."]"""
import sys,json,re,os,base64,time,urllib.request,argparse
KEY=re.search(r'^VENICE_API_KEY=(.+)$',open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(),re.M).group(1).strip('"')
H={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"}
def call(path,body,raw=False):
    req=urllib.request.Request("https://api.venice.ai/api/v1"+path,data=json.dumps(body).encode(),headers=H)
    try:
        r=urllib.request.urlopen(req,timeout=180); data=r.read(); ct=r.headers.get("Content-Type","")
        if "json" in ct: return json.loads(data)
        return {"_binary":data,"_ct":ct,"status":"COMPLETED"}
    except urllib.error.HTTPError as e: print("ERR",path,e.code,e.read()[:600]); sys.exit(1)
b64=lambda p:"data:image/png;base64,"+base64.b64encode(open(p,'rb').read()).decode()
a=argparse.ArgumentParser(); a.add_argument("out"); a.add_argument("prompt"); a.add_argument("--image"); a.add_argument("--end-image"); a.add_argument("--model"); a.add_argument("--duration",default="5s"); a.add_argument("--resolution",default=None); a.add_argument("--aspect",default="16:9"); a.add_argument("--negative")
a.add_argument("--resume"); a.add_argument("--no-audio",action="store_true"); o=a.parse_args()
model=o.model or ("minimax-h3-max-image-to-video" if o.image else "minimax-h3-max-text-to-video")
body={"model":model,"prompt":o.prompt,"duration":o.duration}
if o.resolution: body["resolution"]=o.resolution
if o.image: body["image_url"]=b64(o.image)
else: body["aspect_ratio"]=o.aspect
if o.end_image: body["end_image_url"]=b64(o.end_image)
if o.negative: body["negative_prompt"]=o.negative
if o.no_audio: body["audio"]=False
print("quote",call("/video/quote",{k:body[k] for k in ("model","duration","resolution","prompt") if k in body}))
if o.resume: qid=o.resume; print("resuming",qid)
else:
    r=call("/video/queue",body); qid=r.get("queue_id"); print("queued",qid,r.get("model"))
t0=time.time()
while True:
    time.sleep(6); s=call("/video/retrieve",{"queue_id":qid,"model":model}); st=s.get("status")
    if s.get("_binary"):
        open(o.out,"wb").write(s["_binary"]); print("done",o.out,s["_ct"],f"{time.time()-t0:.0f}s",os.path.getsize(o.out),"bytes"); break
    if s.get("download_url"):
        urllib.request.urlretrieve(s["download_url"],o.out); print("done",o.out,f"{time.time()-t0:.0f}s",os.path.getsize(o.out),"bytes"); break
    if st and st.upper() in ("FAILED","ERROR","CANCELLED"): print("FAILED",json.dumps(s)[:500]); sys.exit(1)
    if int(time.time()-t0)%30<6: print(f"  {st} {time.time()-t0:.0f}s")
