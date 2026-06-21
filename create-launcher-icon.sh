#!/bin/bash
set -euo pipefail

SOURCE="src/assets/Logo.png"
if [ ! -f "$SOURCE" ]; then
  SOURCE="public/Logo.png"
fi
if [ ! -f "$SOURCE" ]; then
  SOURCE="public/icons/icon-192.svg"
fi

resize_icon() {
  local src="$1"
  local size="$2"
  local dest="$3"
  if command -v magick >/dev/null 2>&1; then
    magick convert "$src" -resize "${size}x${size}" "$dest"
  elif command -v convert >/dev/null 2>&1; then
    convert "$src" -resize "${size}x${size}" "$dest"
  else
    echo "ImageMagick (magick or convert) is required to generate launcher icons." >&2
    exit 1
  fi
}

declare -A SIZES=(
  ["mipmap-mdpi"]=48
  ["mipmap-hdpi"]=72
  ["mipmap-xhdpi"]=96
  ["mipmap-xxhdpi"]=144
  ["mipmap-xxxhdpi"]=192
)

RES_ROOT="android/app/src/main/res"

for folder in "${!SIZES[@]}"; do
  px="${SIZES[$folder]}"
  dir="$RES_ROOT/$folder"
  mkdir -p "$dir"
  resize_icon "$SOURCE" "$px" "$dir/ic_launcher.png"
  cp "$dir/ic_launcher.png" "$dir/ic_launcher_round.png"
  echo "Generated $folder icons (${px}px)"
done

echo "Launcher icons ready under $RES_ROOT"
