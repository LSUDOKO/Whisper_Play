@echo off
setlocal enabledelayedexpansion

echo Installing dependencies...

:: Create deps directory
if not exist deps mkdir deps
cd deps

:: Download and extract FFmpeg
if not exist FFmpeg (
    echo Downloading FFmpeg...
    curl -L https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n5.0-latest-win64-gpl-shared-5.0.zip -o ffmpeg.zip
    powershell Expand-Archive ffmpeg.zip -DestinationPath FFmpeg
    del ffmpeg.zip
)

:: Set environment variables for FFmpeg
set FFMPEG_PATH=%CD%\FFmpeg
set PATH=%FFMPEG_PATH%\bin;%PATH%

:: Download Qt (required by OBS)
if not exist Qt (
    echo Downloading Qt...
    curl -L https://cdn.qt.io/archive/qt/5.15/5.15.2/qt-opensource-windows-x86-5.15.2.exe -o qt-installer.exe
    start /wait qt-installer.exe --script ..\qt-silent-install.qs
)

cd ..

echo Dependencies installed successfully!
endlocal
