/**
 * Centralized static asset imports so Vite emits stable hashed URLs in production.
 * Prefer these over `new URL(..., import.meta.url)` which can mis-resolve after deploy.
 */
import frontImage from '../assets/Front.png';
import logoImage from '../assets/Logo.png';
import libImage from '../assets/Lib.jpeg';
import lib1Image from '../assets/Lib1.jpeg';
import lib2Image from '../assets/Lib2.jpeg';
import transformImage from '../assets/Transform.png';
import libraryApk from '../assets/LibraryConnekto.apk?url';

export const ASSETS = {
  front: frontImage,
  logo: logoImage,
  lib: libImage,
  lib1: lib1Image,
  lib2: lib2Image,
  transform: transformImage,
  apk: libraryApk,
};

export const HERO_IMAGES = [frontImage, libImage, lib1Image, lib2Image];

export default ASSETS;
