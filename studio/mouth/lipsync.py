"""Audio-driven mouth overlay (N visemes). Usage: python studio/mouth/lipsync.py <voice.wav> <out.mp4> [--sprites DIR] [--bg loop.mp4]
Viseme choice per frame from loudness (RMS, peak-normalised, attack fast / release slow) and brightness (zero-crossing rate):
bright+loud = consonant-ish → half/slight; dark+loud = vowel → open/tongue/oh. Rest = v0 (smile) when quiet.
Also writes <out>.visemes.json (frame → viseme) for the Remotion frame."""
import sys,os,argparse,subprocess,wave,struct,math,json
from PIL import Image
a=argparse.ArgumentParser(); a.add_argument("voice"); a.add_argument("out"); a.add_argument("--sprites",default=os.path.join(os.path.dirname(os.path.abspath(__file__)),"a"))
a.add_argument("--bg",default=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","assets","anchor-idle-v1.mp4")); a.add_argument("--fps",type=int,default=24); a.add_argument("--json-only",action="store_true")
o=a.parse_args(); P=json.load(open(os.path.join(o.sprites,"placement.json"))) if os.path.exists(os.path.join(o.sprites,"placement.json")) else {"cx":918,"cy":641,"w":158,"n":5}
def analyse(voice,fps):
    pcm=voice+".pcm.wav"; subprocess.run(["ffmpeg","-loglevel","error","-y","-i",voice,"-ac","1","-ar","24000",pcm],check=True)
    w=wave.open(pcm); n=w.getnframes(); sr=w.getframerate(); d=struct.unpack(f"<{n}h",w.readframes(n)); w.close(); os.remove(pcm)
    nf=int(math.ceil(n/sr*fps)); hop=sr//fps; rms=[];zcr=[]
    for i in range(nf):
        seg=d[i*hop:(i+1)*hop] or (0,); rms.append(math.sqrt(sum(x*x for x in seg)/len(seg))/32768)
        zcr.append(sum(1 for j in range(1,len(seg)) if (seg[j]>=0)!=(seg[j-1]>=0))/len(seg))
    peak=max(rms) or 1; lv=[];prev=0
    for r in rms: v=min(1,r/peak*1.5); prev=v if v>prev else prev*0.6; lv.append(prev)
    vis=[]
    for i,(v,z) in enumerate(zip(lv,zcr)):
        bright=z>0.12
        if v<0.07: k=0
        elif v<0.22: k=1
        elif v<0.42: k=2
        elif v<0.65: k=2 if bright else (3 if (i//3)%2 else 4)
        else: k=4 if bright else (5 if (i//4)%2 else 4)
        vis.append(min(k,P["n"]-1))
    # min hold 2 frames to avoid 1-frame flicker
    for i in range(1,len(vis)-1):
        if vis[i]!=vis[i-1] and vis[i+1]==vis[i-1]: vis[i]=vis[i-1]
    return vis,n/sr
vis,dur=analyse(o.voice,o.fps); json.dump({"fps":o.fps,"visemes":vis,"duration":dur},open(o.out+".visemes.json","w"))
if o.json_only: print("visemes",len(vis)); sys.exit()
TMP=o.out+".frames"; os.makedirs(TMP,exist_ok=True)
sprites=[Image.open(f"{o.sprites}/v{i}.png").convert("RGBA") for i in range(P["n"])]
probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","json",o.bg])); W,H=probe["streams"][0]["width"],probe["streams"][0]["height"]
for i,v in enumerate(vis):
    fr=Image.new("RGBA",(W,H),(0,0,0,0)); s=sprites[v]; fr.paste(s,(P["cx"]-s.width//2,P["cy"]-s.height//2),s); fr.save(f"{TMP}/{i:05d}.png")
subprocess.run(["ffmpeg","-loglevel","error","-y","-stream_loop","-1","-i",o.bg,"-framerate",str(o.fps),"-i",f"{TMP}/%05d.png","-i",o.voice,"-filter_complex","[0:v][1:v]overlay=0:0:shortest=1[v]","-map","[v]","-map","2:a","-c:v","libx264","-pix_fmt","yuv420p","-crf","18","-c:a","aac","-t",f"{dur:.3f}",o.out],check=True)
subprocess.run(["rm","-rf",TMP]); from collections import Counter; print("done",o.out,f"{dur:.2f}s","viseme use",dict(sorted(Counter(vis).items())))
