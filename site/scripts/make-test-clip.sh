#!/usr/bin/env bash
# Generate the synthetic test media used until real footage arrives (#2, #5):
# - sticker: an orange disc with a white "scissor-cut" border looping every 3 s on a
#   transparent background, standing in for a cut-out of Amy;
# - portal, portal-portrait: a dark hero frame with a lit rim around a transparent
#   central opening, in landscape and portrait cuts, standing in for the hero clip.
# Each goes through the whole pipeline (alpha master → stacked AV1/HEVC → poster), so
# a deploy preview can prove transparency on real devices.
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

# The hero: transparent inside radius r, a lit rim just outside it, a dark vignette
# beyond, and a slow 4 s flicker. $1 size, $2 radius expression, $3 rim width, $4 name.
portal() {
  local c='hypot(X-W/2,Y-H/2)' r=$2 w=$3
  local rim="if(between($c,$r,$r+$w),55*(1-abs($c-$r-$w/2)/($w/2)),0)"
  master "color=c=black:s=$1:r=30:d=4,format=rgba" \
    "geq=r='clip(14+18*(1-$c/max(W,H))+$rim+6*sin(2*PI*T/4),0,255)':g='clip(16+18*(1-$c/max(W,H))+$rim*0.9+6*sin(2*PI*T/4),0,255)':b='clip(20+22*(1-$c/max(W,H))+$rim*0.8+6*sin(2*PI*T/4),0,255)':a='clip(($c-$r)*64,0,255)'" \
    "$tmp/$4.mov"
}
portal 640x360 "(H*0.27)" 10 portal
WIDTH=1280 AV1_CPU=6 HEVC_PRESET=medium bash scripts/encode-alpha.sh "$tmp/portal.mov" public/media/test/portal
portal 360x640 "(W*0.3)" 8 portal-portrait
WIDTH=720 AV1_CPU=6 HEVC_PRESET=medium bash scripts/encode-alpha.sh "$tmp/portal-portrait.mov" public/media/test/portal-portrait
