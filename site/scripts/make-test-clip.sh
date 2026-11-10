#!/usr/bin/env bash
# Generate the synthetic test media used until real footage arrives (#2, #5):
# sticker, an orange disc with a white "scissor-cut" border looping every 3 s on a
# transparent background, standing in for a cut-out of Amy. It goes through the whole
# pipeline (alpha master → stacked AV1/HEVC → poster), so a deploy preview can prove
# transparency on real devices.
set -euo pipefail
cd "$(dirname "$0")/.."

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

master() { ffmpeg -v error -y -f lavfi -i "$1" -vf "$2" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le "$3"; }

# Distance from the disc's centre, which circles the frame once per 3 s. The disc
# (radius 112 with its border) stays inside the 360x640 frame.
d='hypot(X-(W/2+60*sin(2*PI*T/3)),Y-(H/2+140*cos(2*PI*T/3)))'
master "color=c=black@0:s=360x640:r=30:d=3,format=rgba" \
  "geq=r='if(lt($d,96),232,255)':g='if(lt($d,96),92,255)':b='if(lt($d,96),44,255)':a='clip((112-$d)*128,0,255)'" \
  "$tmp/sticker.mov"
WIDTH=360 AV1_CPU=6 HEVC_PRESET=medium bash scripts/encode-alpha.sh "$tmp/sticker.mov" public/media/test/sticker
