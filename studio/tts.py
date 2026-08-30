"""Doge anchor voice: Kokoro-82M (mlx-audio, on-device) `am_santa` + toon-heavy pitch treatment.
Usage: uv run --project ~/Developer/Personal/privoice python studio/tts.py "text" out.wav
       or import: from tts import speak; speak(text, out_path)
"""
import subprocess, sys, os, numpy as np, soundfile as sf
VOICE, SPEED, SR = "am_santa", 1.05, 24000
TOON = "asetrate=24000*1.32,aresample=24000,atempo=0.80"
_model = None
def _m():
    global _model
    if _model is None:
        from mlx_audio.tts.utils import load_model
        _model = load_model("prince-canuma/Kokoro-82M")
    return _model
def speak(text: str, out_path: str) -> float:
    """Render text to out_path (wav, 24k mono, toon-treated). Returns duration in seconds."""
    audio = np.concatenate([r.audio for r in _m().generate(text=text, voice=VOICE, speed=SPEED)])
    raw = out_path + ".raw.wav"; sf.write(raw, audio, SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", TOON, out_path], check=True)
    os.remove(raw)
    return sf.info(out_path).duration
if __name__ == "__main__":
    print(speak(sys.argv[1], sys.argv[2]))
