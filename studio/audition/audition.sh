#!/bin/zsh
# Voice audition: one Doge line through candidate Venice TTS voices. Usage: ./audition.sh
K=$(grep -m1 VENICE_API_KEY ~/Developer/Personal/venice-inspect/.env | cut -d= -f2 | tr -d '"')
LINE="Much breaking news. Venice just dropped MiniMax H3 Max, and it makes a whole video in fifteen seconds. Wow. Bitcoin is up, my treats are not. Stay tuned."
OUT=$(dirname $0)/out; mkdir -p $OUT
while read model voice; do
  f=$OUT/${model#tts-}__$voice.mp3
  [ -s $f ] && continue
  curl -s -X POST https://api.venice.ai/api/v1/audio/speech -H "Authorization: Bearer $K" -H 'Content-Type: application/json' \
    -d "{\"model\":\"$model\",\"input\":\"$LINE\",\"voice\":\"$voice\",\"response_format\":\"'$FMT'\"}" -o $f
  echo "$f $(stat -f%z $f)B"
done <<LIST
tts-kokoro am_puck
tts-kokoro am_fenrir
tts-chatterbox-hd Rico
tts-chatterbox-hd Carl
tts-minimax-speech-02-hd CasualGuy
tts-minimax-speech-02-hd DeepVoiceMan
tts-elevenlabs-turbo-v2-5 Charlie
tts-xai-v1 cosmo
tts-inworld-1-5-max Pixie
tts-orpheus zac
LIST
