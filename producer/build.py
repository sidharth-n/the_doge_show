"""Build episode data for the Remotion app: VO per segment (local Kokoro), viseme timeline, timings → tv/public/episode.json
Usage (from privoice env for mlx-audio): cd ~/Developer/Personal/privoice && uv run python ~/Developer/Personal/dogeshow/producer/build.py producer/rundown-2026-08-30.json"""
import json,sys,os,math,wave,struct,subprocess,shutil
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,os.path.join(ROOT,"studio"))
FPS=24; PUB=os.path.join(ROOT,"tv","public"); os.makedirs(os.path.join(PUB,"vo"),exist_ok=True); os.makedirs(os.path.join(PUB,"mouth"),exist_ok=True)
rd=json.load(open(os.path.join(ROOT,sys.argv[1])))
from tts import speak
def visemes(wav):
    """delegate to studio/mouth/lipsync.py --json-only (6 shapes, loudness+ZCR, step-limited)"""
    subprocess.run(["/opt/homebrew/bin/python3",os.path.join(ROOT,"studio","mouth","lipsync.py"),wav,wav+".tmp","--json-only"],check=True,capture_output=True)
    j=json.load(open(wav+".tmp.visemes.json")); os.remove(wav+".tmp.visemes.json"); return j["visemes"], j["duration"]
t=0.0; GAP=0.35
for s in rd["segments"]:
    if s.get("script"):
        wav=os.path.join(PUB,"vo",s["id"]+".wav")
        if not os.path.exists(wav): speak(s["script"],wav)
        vis,dur=visemes(wav); s["vo"]=f"vo/{s['id']}.wav"; s["visemes"]=vis; s["duration"]=round(dur+GAP,3)
    else: s["duration"]=s.get("hold",5)
    s["start"]=round(t,3); t+=s["duration"]
P=json.load(open(os.path.join(ROOT,"studio","mouth","a","placement.json")))
rd["fps"]=FPS; rd["total"]=round(t,3); rd["anchor"]={"loop":"anchor-idle.mp4","cx":P["cx"],"cy":P["cy"],"w":P["w"],"n":P["n"],"srcW":1928,"srcH":1072}
for i in range(P["n"]): shutil.copy(os.path.join(ROOT,"studio","mouth","a",f"v{i}.png"),os.path.join(PUB,"mouth",f"v{i}.png"))
shutil.copy(os.path.join(ROOT,"studio","assets","anchor-idle-v1.mp4"),os.path.join(PUB,"anchor-idle.mp4"))
json.dump(rd,open(os.path.join(PUB,"episode.json"),"w"),indent=1)
print(f"episode {rd['total']:.1f}s, {len(rd['segments'])} segments"); [print(f"  {s['start']:6.1f}  {s['duration']:5.1f}  {s['id']:6} {s['title']}") for s in rd["segments"]]
