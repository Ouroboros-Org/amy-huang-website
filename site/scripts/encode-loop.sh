#!/usr/bin/env bash
# Encode a full-screen video for the page: the intro's city and the hero's loop of Amy.
#
#   npm run media:loop -- <source video> <output base> [crf] [webm crf]
#
# Writes <base>.webm and <base>.mp4 (1920 wide), <base>-720.webm and <base>-720.mp4
# (1280 wide, for screens up to 60rem) and <base>.poster.webp (the first frame), all
# without sound. The WebMs are VP9 in two passes; the MP4s, the fallback for browsers
# without VP9, are H.264 with the index at the front, so playback starts before the
# download ends. A higher crf is smaller and softer: the city uses 30 for the MP4s and
# 46 for the WebMs (the default), which look alike and leave the WebM smaller.
#
#   npm run media:loop -- master.mp4 public/media/intro/city 30
#   npm run media:loop -- amy.mp4 public/media/hero/amy 28
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: encode-loop.sh <source video> <output base> [crf] [webm crf]" >&2
  exit 2
fi
source=$1
base=$2
crf=${3:-28}
webm_crf=${4:-46}
mkdir -p "$(dirname "$base")"
passlog=$(mktemp -d)
trap 'rm -rf "$passlog"' EXIT

mp4() {
  ffmpeg -v error -y -i "$source" -an \
    -vf "scale=$1:-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$crf" -profile:v high -movflags +faststart "$2"
}

webm() {
  local vp9=(-an -vf "scale=$1:-2:flags=lanczos,format=yuv420p" -c:v libvpx-vp9
    -b:v 0 -crf "$webm_crf" -row-mt 1 -tile-columns 2 -deadline good
    -passlogfile "$passlog/$1")
  ffmpeg -v error -y -i "$source" "${vp9[@]}" -cpu-used 4 -pass 1 -f null -
  ffmpeg -v error -y -i "$source" "${vp9[@]}" -cpu-used 1 -auto-alt-ref 1 \
    -lag-in-frames 25 -pass 2 "$2"
}

webm 1920 "$base.webm"
webm 1280 "$base-720.webm"
mp4 1920 "$base.mp4"
mp4 1280 "$base-720.mp4"
ffmpeg -v error -y -i "$source" -frames:v 1 -vf "scale=1920:-2" -c:v libwebp -quality 72 \
  "$base.poster.webp"
ls -l "$base".* "$base"-720.*
