"""Amplitude-driven mouth overlay. Usage: python studio/mouth/lipsync.py <voice.wav> <out.mp4> [--bg loop.mp4] [--cx 918 --cy 641 --w 158]
Reads the VO, computes RMS per frame (24 fps), maps to viseme v0..v4 with smoothing + hold, and burns the sprite onto the looped
background with ffmpeg. Produces a lipsynced anchor clip the length of the audio."""
import sys,os,argparse,subprocess,wave,struct,math,json
from PIL import Image
a=argparse.ArgumentParser(); a.add_argument("voice"); a.add_argument("out"); a.add_argument("--bg",default=os.path.join(os.path.dirname(__file__),"..","assets","anchor-idle-v1.mp4"))
a.add_argument("--cx",type=int,default=918); a.add_argument("--cy",type=int,default=641); a.add_argument("--w",type=int,default=158); a.add_argument("--fps",type=int,default=24)
o=a.parse_args(); HERE=os.path.dirname(os.path.abspath(__file__)); TMP=o.out+".frames"; os.makedirs(TMP,exist_ok=True)
# audio → mono 24k pcm
pcm=o.out+".pcm.wav"; subprocess.run(["ffmpeg","-loglevel","error","-y","-i",o.voice,"-ac","1","-ar","24000",pcm],check=True)
w=wave.open(pcm); n=w.getnframes(); sr=w.getframerate(); data=struct.unpack(f"<{n}h",w.readframes(n)); w.close()
dur=n/sr; nf=int(math.ceil(dur*o.fps)); hop=sr//o.fps
rms=[math.sqrt(sum(x*x for x in data[i*hop:(i+1)*hop])/max(1,hop))/32768 for i in range(nf)]
peak=max(rms) or 1; lv=[min(1,r/peak*1.4) for r in rms]
# smooth + open-hold so it doesn't flicker
sm=[]; prev=0
for v in lv: prev=max(v,prev*0.55); sm.append(prev)
vis=[0 if v<0.08 else 1 if v<0.25 else 2 if v<0.45 else 3 if v<0.7 else 4 for v in sm]
sprites=[Image.open(f"{HERE}/v{i}.png").convert("RGBA") for i in range(5)]
scale=o.w/sprites[0].width; sp=[s.resize((int(s.width*scale),int(s.height*scale)),Image.LANCZOS) for s in sprites]
# write one transparent PNG per frame (only mouth) — ffmpeg overlays them on the looping bg
probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","json",o.bg]))
W,H=probe["streams"][0]["width"],probe["streams"][0]["height"]
for i,v in enumerate(vis):
    fr=Image.new("RGBA",(W,H),(0,0,0,0)); s=sp[v]; fr.paste(s,(o.cx-s.width//2,o.cy-s.height//2),s); fr.save(f"{TMP}/{i:05d}.png")
subprocess.run(["ffmpeg","-loglevel","error","-y","-stream_loop","-1","-i",o.bg,"-framerate",str(o.fps),"-i",f"{TMP}/%05d.png","-i",o.voice,
  "-filter_complex",f"[0:v][1:v]overlay=0:0:shortest=1[v]","-map","[v]","-map","2:a","-c:v","libx264","-pix_fmt","yuv420p","-crf","18","-c:a","aac","-t",f"{dur:.3f}",o.out],check=True)
subprocess.run(["rm","-rf",TMP,pcm]); print("done",o.out,f"{dur:.2f}s",f"visemes open {sum(1 for v in vis if v)}/{nf} frames")
