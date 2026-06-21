#!/bin/bash
set -euo pipefail

SOURCE="public/Logo.png"
if [ ! -f "$SOURCE" ]; then
  SOURCE="src/assets/Logo.png"
fi
if [ ! -f "$SOURCE" ]; then
  SOURCE="public/icons/icon-192.svg"
fi

if [ ! -f "$SOURCE" ]; then
  echo "Logo not found. Expected public/Logo.png or src/assets/Logo.png" >&2
  exit 1
fi

echo "Using logo source: $SOURCE"

resize_icon() {
  local src="$1"
  local size="$2"
  local dest="$3"
  local safe_ratio="${4:-1}"

  local inner=$(( size * 72 / 108 ))
  if [ "$safe_ratio" = "1" ]; then
    inner=$size
  fi

  local args=(
    "$src"
    -resize "${inner}x${inner}"
    -background white
    -gravity center
    -extent "${size}x${size}"
    "$dest"
  )

  if command -v magick >/dev/null 2>&1; then
    magick convert "${args[@]}"
  elif command -v convert >/dev/null 2>&1; then
    convert "${args[@]}"
  else
    echo "ImageMagick (magick or convert) is required to generate launcher icons." >&2
    exit 1
  fi
}

declare -A LEGACY_SIZES=(
  ["mipmap-mdpi"]=48
  ["mipmap-hdpi"]=72
  ["mipmap-xhdpi"]=96
  ["mipmap-xxhdpi"]=144
  ["mipmap-xxxhdpi"]=192
)

declare -A ADAPTIVE_SIZES=(
  ["mipmap-mdpi"]=108
  ["mipmap-hdpi"]=162
  ["mipmap-xhdpi"]=216
  ["mipmap-xxhdpi"]=324
  ["mipmap-xxxhdpi"]=432
)

RES_ROOT="android/app/src/main/res"

for folder in "${!LEGACY_SIZES[@]}"; do
  px="${LEGACY_SIZES[$folder]}"
  dir="$RES_ROOT/$folder"
  mkdir -p "$dir"
  resize_icon "$SOURCE" "$px" "$dir/ic_launcher.png" 1
  cp "$dir/ic_launcher.png" "$dir/ic_launcher_round.png"
  echo "Generated legacy $folder icons (${px}px)"
done

for folder in "${!ADAPTIVE_SIZES[@]}"; do
  px="${ADAPTIVE_SIZES[$folder]}"
  dir="$RES_ROOT/$folder"
  mkdir -p "$dir"
  resize_icon "$SOURCE" "$px" "$dir/ic_launcher_foreground.png" 0
  echo "Generated adaptive foreground $folder (${px}px)"
done

echo "Launcher icons ready under $RES_ROOT"
