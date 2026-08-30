"""Producer: turn curated newsroom items into a TV rundown (segments + scripts + overlay cues) via Venice LLM.
Usage: python producer/rundown.py newsroom/raw/2026-08-30.json producer/rundown-2026-08-30.json
"""
import json, sys, os, re, urllib.request
KEY = re.search(r'^VENICE_API_KEY=(.+)$', open(os.path.expanduser('~/Developer/Personal/venice-inspect/.env')).read(), re.M).group(1).strip('"')
MODEL = os.environ.get("MODEL", "grok-4-6")
# Editorial selection (judgement stays with us, not the model): substrings of URL/title that make the cut.
PICKS = {
 "venice": ["2093035793568641461","2092992500348727551","2093429159460786590","2093035795816837471","2093273852386124089","2092721909880312056","2091717693019992184","2093400339722424546","2091647873800696264"],
 "ai": ["sony-music","illegally-blacklisted","jensen-huang","openai-greg-brockman","hugging-face-microdu"],
 "crypto": ["bitcoin-hits-hig","live-updates-bi","solana-vote-to-doub","bitcoin-wallets-","usd1-1-million-cr","circle-s-usdc-t"],
}
RUNDOWN_SPEC = """Write a 3-minute (about 430-470 spoken words total) news bulletin as JSON with this exact shape:
{"title": str, "segments": [{"id": str, "type": "cold_open|headlines|story|markets|social|signoff",
  "block": "A|B|C", "title": str, "lower_third": str, "ticker": [str,...] (3-6 short items),
  "script": str (what Doge says, spoken text only), "target_seconds": int,
  "visuals": [{"kind": "quote_card|screenshot|chart|photo|h3_clip|anchor", "ref": str (URL or coin symbol or prompt), "caption": str}],
  "sfx": [str] (from: sting, whoosh, breaking, ticker_tick, chart_up, chart_down, bark, wow)}]}
Structure (a real news wheel, condensed):
1 cold_open (8s): sting + one-line tease. visuals: h3_clip with a cinematic prompt of Doge anchor in a neon newsroom.
2 headlines (20s): five one-line headlines across Venice, AI, crypto.
3 story A-block VENICE (55s): MiniMax H3 Max on Venice - the speed claim (15s of footage in 21s), Erik's post, the Seedance 2.5 vs H3 Max head-to-head (4m56s vs ~21s), 50% off until Sept 1, plus the week's other Venice drops (Gemini Omni 1.1 Flash, GLM 5.3 Flash, Wan 3.0, Lumara film festival $100K). Include one h3_clip visual with a prompt, two quote_cards (the AskVenice and Erik posts).
4 story AI (40s): two or three AI stories with quote_card/screenshot visuals.
5 markets (25s): BTC, ETH, SOL, DOGE prices and 24h moves from PRICES, the Warsh/Jackson Hole slide context. visuals: chart per coin.
6 story crypto (30s): two crypto stories. 
7 social (15s): what people are saying about H3 Max on X (use the replies in the data if any) - one quote_card.
8 signoff (10s): "we're live 24/7 on YouTube and Twitch", Doge punchline, sting.
Only use facts present in the DATA below. Attribute sources. Output ONLY the JSON."""
def main(raw, out):
    d = json.load(open(raw)); sel = {}
    for b, keys in PICKS.items():
        sel[b] = [i for i in d[b] if any(k in (i.get("url","")+i.get("title","")) for k in keys)]
    sel["prices"] = [p for p in d["prices"] if (p.get("symbol") or "").upper() in ("BTC","ETH","SOL","DOGE","XRP","BNB")]
    persona = open(os.path.join(os.path.dirname(__file__), "persona.md")).read()
    body = {"model": MODEL, "temperature": 0.7, "messages": [
        {"role": "system", "content": persona},
        {"role": "user", "content": RUNDOWN_SPEC + "\n\nDATA:\n" + json.dumps(sel, ensure_ascii=False)}]}
    req = urllib.request.Request("https://api.venice.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=300))
    txt = r["choices"][0]["message"]["content"]; txt = txt[txt.find("{"):txt.rfind("}")+1]
    rd = json.loads(txt); rd["_model"] = MODEL; rd["_usage"] = r.get("usage")
    json.dump(rd, open(out, "w"), indent=1, ensure_ascii=False)
    words = sum(len(s["script"].split()) for s in rd["segments"])
    print(f"{len(rd['segments'])} segments, {words} words, usage {r.get('usage')}")
    for s in rd["segments"]: print(f"- [{s['type']}] {s['title']} ({s['target_seconds']}s, {len(s['script'].split())}w)")
if __name__ == "__main__": main(sys.argv[1], sys.argv[2])
