#!/usr/bin/env bash
# Encode a full-screen video for the page: the intro's city and the hero's loop of Amy.
#
#   npm run media:loop -- <source video> <output base> [crf]
#
# Writes <base>.mp4 (1920 wide), <base>-720.mp4 (1280 wide, for screens up to 60rem)
# and <base>.poster.webp (the first frame), all without sound. H.264 with the index at
# the front, so playback starts before the download ends. A higher crf is smaller and
# softer: the city uses 30, Amy's loop 28.
#
#   npm run media:loop -- city.mp4 public/media/intro/city 30
#   npm run media:loop -- amy.mp4 public/media/hero/amy 28
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: encode-loop.sh <source video> <output base> [crf]" >&2
  exit 2
fi
source=$1
base=$2
crf=${3:-28}
mkdir -p "$(dirname "$base")"

encode() {
  ffmpeg -v error -y -i "$source" -an \
    -vf "scale=$1:-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$crf" -profile:v high -movflags +faststart "$2"
}

encode 1920 "$base.mp4"
encode 1280 "$base-720.mp4"
ffmpeg -v error -y -i "$source" -frames:v 1 -vf "scale=1920:-2" -c:v libwebp -quality 72 \
  "$base.poster.webp"
ls -l "$base.mp4" "$base-720.mp4" "$base.poster.webp"
