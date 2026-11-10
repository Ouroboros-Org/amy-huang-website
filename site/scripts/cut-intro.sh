#!/usr/bin/env bash
# Cut the intro: 5 s at 30 fps, 1920x1080, without sound. 4.5 s of busy cities at night
# in cuts that keep shortening, then 0.5 s of a traffic light switching to red.
#
#   npm run media:cut-intro -- <clips dir> <master.mp4>
#   npm run media:loop -- <master.mp4> public/media/intro/city 30
#
# The clips are Pexels videos (https://www.pexels.com/video/<id>/), saved in <clips dir>
# as <id>.mp4 in the size given below; the clips and the master stay out of the
# repository. No night clip on Pexels turns red going forward, so the last shot is a
# red-to-green change played backwards.
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: cut-intro.sh <clips dir> <master.mp4>" >&2
  exit 2
fi
clips=$1
master=$2
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

fit="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1"
n=0

# Writes one shot of <frames> frames, from <start> seconds into the clip, sped up <speed>
# times. The shots are near-lossless until the master.
shot() { # id start speed frames [filters before the fit]
  local id=$1 start=$2 speed=$3 frames=$4 pre=${5:-setpts=(PTS-STARTPTS)/$3}
  n=$((n + 1))
  local name; name=$(printf '%02d.mp4' "$n")
  ffmpeg -v error -y -ss "$start" ${6:+-t "$6"} -i "$clips/$id.mp4" -an \
    -vf "$pre,fps=30,$fit,format=yuv420p" \
    -frames:v "$frames" -c:v libx264 -preset fast -crf 10 -r 30 "$work/$name"
  # Relative to the list, so the path holds on Windows too.
  echo "file '$name'" >> "$work/list.txt"
}

# The rush: 135 frames.          clip size
shot 10161875 0.3  1   18 # 2560x1440, Hong Kong taxis in the rain, from above
shot 19743527 0.5  2   16 # 1920x1080, Shibuya crossing, the crowd under the screens
shot 10443582 5.8  1   14 # 1920x1080, Hong Kong street with buses, time-lapse
shot 10161871 3.2  1.5 12 # 1280x720,  Hong Kong traffic, tail lights
shot 31177207 17   2   11 # 1920x1080, Shibuya crossing, walking towards the camera
shot 10443584 8.5  1   10 # 1920x1080, Hong Kong crossing, trams, time-lapse
shot 38006965 4.9  1.5 9  # 1920x1080, Tokyo crossing at street level
shot 10161877 6.0  1   8  # 1920x1080, Hong Kong tower and traffic, time-lapse
shot 9609447  13   2   7  # 1920x1080, Hong Kong bus stop, double-decker
shot 10161874 0    1   6  # 1920x1080, Hong Kong tram passing
shot 31177207 21   2   6
shot 10443582 15.5 1   5
shot 14952031 40   2   5  # 1280x720,  Shibuya crossing, the crowd at eye level
shot 10161871 0.8  1   4
shot 10443584 14.6 1   4

# The light: 15 frames. Played backwards, the half second around its turn to green
# reads as green (3 frames), the change (5) and red (7). Punched in on the light.
shot 31989388 2.333 1 15 "reverse,setpts=PTS-STARTPTS,crop=1440:810:300:170" 0.5 # 1920x1080, Jakarta

mkdir -p "$(dirname "$master")"
ffmpeg -v error -y -f concat -safe 0 -i "$work/list.txt" -an \
  -c:v libx264 -preset slow -crf 8 -pix_fmt yuv420p "$master"
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=width,height,nb_read_frames:format=duration -of compact=p=0 "$master"
