"""Venice image edit helper. Usage: python studio/edit.py <in.png> <out.png> "<prompt>" [model] [resolution]"""
import sys,json,re,os,base64,urllib.request
KEY=re.search(r'^VENICE_API_KEY=(.+)$',open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(),re.M).group(1).strip('"')
inp,out,prompt=sys.argv[1:4]; model=sys.argv[4] if len(sys.argv)>4 else "nano-banana-pro-edit"; res=sys.argv[5] if len(sys.argv)>5 else "2K"
body={"model":model,"image":base64.b64encode(open(inp,'rb').read()).decode(),"prompt":prompt,"aspect_ratio":"16:9","resolution":res,"output_format":"png"}
req=urllib.request.Request("https://api.venice.ai/api/v1/image/edit",data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"})
try:
    r=urllib.request.urlopen(req,timeout=300); data=r.read(); open(out,"wb").write(data)
    print(out,len(data),"bytes | model",r.headers.get("x-venice-model-id"),"| balance",r.headers.get("X-Balance-Remaining"))
except urllib.error.HTTPError as e: print("ERR",e.code,e.read()[:400])
