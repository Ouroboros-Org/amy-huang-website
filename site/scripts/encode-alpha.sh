#!/usr/bin/env bash
# Encode a master clip with an alpha channel into the stacked-alpha files the site plays:
# colour on top, alpha as brightness underneath, in one ordinary video (see
# https://github.com/jakearchibald/stacked-alpha-video). Browsers pick AV1 when they
# can decode it and HEVC otherwise; the WebP poster shows until the first frame draws.
#
#   scripts/encode-alpha.sh <master.mov> <output-base>
#
# Writes <output-base>.av1.mp4, <output-base>.hevc.mp4 and <output-base>.poster.webp.
# Tune with environment variables: WIDTH (default 720), FPS (30), AV1_CRF (45),
# AV1_CPU (3), HEVC_CRF (30), HEVC_PRESET (veryslow). SCRUB=1 makes every frame a
# keyframe, for the rare clip that scroll scrubs instead of playing.
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <master-with-alpha> <output-base>" >&2
  exit 2
fi
input=$1
out=$2
width=${WIDTH:-720}
fps=${FPS:-30}
gop=()
if [ "${SCRUB:-0}" = 1 ]; then gop=(-g 1); fi

mkdir -p "$(dirname "$out")"
passlog=$(mktemp -d)
trap 'rm -rf "$passlog"' EXIT

stack="[0:v]fps=${fps},scale=${width}:-2:flags=lanczos,format=pix_fmts=yuva444p[main];[main]split[main][alpha];[alpha]alphaextract[alpha];[main][alpha]vstack"

ffmpeg -v error -y -i "$input" -filter_complex "$stack" -pix_fmt yuv420p -an \
  -c:v libaom-av1 -cpu-used "${AV1_CPU:-3}" -crf "${AV1_CRF:-45}" ${gop[@]+"${gop[@]}"} \
  -pass 1 -passlogfile "$passlog/av1" -f null -
ffmpeg -v error -y -i "$input" -filter_complex "$stack" -pix_fmt yuv420p -an \
  -c:v libaom-av1 -cpu-used "${AV1_CPU:-3}" -crf "${AV1_CRF:-45}" ${gop[@]+"${gop[@]}"} \
  -pass 2 -passlogfile "$passlog/av1" -movflags +faststart "$out.av1.mp4"

ffmpeg -v error -y -i "$input" -filter_complex "$stack" -pix_fmt yuv420p -an \
  -c:v libx265 -preset "${HEVC_PRESET:-veryslow}" -crf "${HEVC_CRF:-30}" ${gop[@]+"${gop[@]}"} \
  -x265-params log-level=error -tag:v hvc1 -movflags +faststart "$out.hevc.mp4"

ffmpeg -v error -y -i "$input" -frames:v 1 -vf "scale=${width}:-2:flags=lanczos,format=yuva420p" \
  -c:v libwebp -quality 80 "$out.poster.webp"

ls -l "$out".*
