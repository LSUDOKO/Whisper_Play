@echo off
setlocal enabledelayedexpansion

echo Setting up WebRTC development environment...

:: Create WebRTC directory
if not exist webrtc mkdir webrtc
cd webrtc

:: Install depot_tools if not present
if not exist depot_tools (
    echo Cloning depot_tools...
    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
)

:: Add depot_tools to PATH
set PATH=%CD%\depot_tools;%PATH%

:: Get WebRTC
if not exist src (
    echo Fetching WebRTC source...
    fetch --nohooks webrtc
    cd src
    git checkout branch-heads/5481
    gclient sync -D
) else (
    cd src
)

:: Generate build files
gn gen out/Release --args="is_debug=false is_component_build=false rtc_include_tests=false rtc_enable_protobuf=false use_rtti=true is_clang=false"

:: Build WebRTC
ninja -C out/Release

echo WebRTC build complete!
endlocal
