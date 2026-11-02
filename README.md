SOSAC - portable version
========================

Sosac is a Windows program for downloading videos and music, trimming,
converting formats and browsing public profiles. Nothing is installed.

HOW TO RUN
----------
1. Unzip the whole folder anywhere (desktop, USB drive, ...).
2. Run Sosac.exe.

Keep portable.txt next to Sosac.exe. It makes the program store its
settings, library and logins in a "data" folder next to the program
instead of in the system. The whole folder can be moved or backed up as is.

REQUIREMENTS
------------
- Windows 10 or 11 (64-bit)
- Microsoft WebView2 Runtime (already included in Windows 11 and recent
  Windows 10)
- For Instagram and Facebook, Microsoft Edge or Google Chrome must be
  installed
- Internet connection

FIRST START
-----------
On first launch Sosac unpacks its tools (yt-dlp, ffmpeg, ffprobe and deno)
into the "data" folder. This takes a moment; do not close the program.
Windows SmartScreen may show a warning because the program is not code
signed. Choose "More info" and then "Run anyway".

PERSONAL DATA
-------------
The "data" folder contains your logins (Instagram, Facebook, YouTube),
your library and settings. If you share the program with someone, delete
the "data" folder or do not include it. You can also erase the program's
data in Settings (Data section).

USE
---
Only download content you have the right to download (your own, freely
licensed, or with the author's permission). The user is responsible for
respecting copyright and the terms of service of third-party services
(YouTube, Instagram, Facebook and others). Sosac is not affiliated with
any of these services.

THIRD-PARTY SOFTWARE
--------------------
Sosac uses these separate programs:
- yt-dlp (Unlicense, public domain)  https://github.com/yt-dlp/yt-dlp
- FFmpeg / ffprobe (GPLv3 build)     https://ffmpeg.org
- Deno (MIT)                         https://deno.com

These programs are not covered by the Sosac license and have their own
licenses. The license texts are in the LICENSES folder
(LICENSE-yt-dlp.txt, LICENSE-FFmpeg-GPLv3.txt, LICENSE-Deno.txt).
FFmpeg source code is available at https://ffmpeg.org/download.html; the
source of the specific build used is available from where it was
downloaded.

LICENSE
-------
Sosac:   see LICENSES/LICENSE-Sosac.txt
yt-dlp:  see LICENSES/LICENSE-yt-dlp.txt
FFmpeg:  see LICENSES/LICENSE-FFmpeg-GPLv3.txt
Deno:    see LICENSES/LICENSE-Deno.txt

The program is provided "as is", without warranty of any kind.
