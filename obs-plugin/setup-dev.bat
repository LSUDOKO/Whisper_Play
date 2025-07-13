@echo off
setlocal enabledelayedexpansion

echo Setting up OBS Plugin development environment...

:: First install dependencies
call setup-deps.bat

:: Set environment variables
set QTDIR=C:\Qt\5.15.2\msvc2019_64
set Qt5_DIR=%QTDIR%
set PATH=%QTDIR%\bin;%PATH%
set CMAKE_PREFIX_PATH=%QTDIR%

:: Check for Visual Studio
where cl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Visual Studio not found in PATH
    echo Please run this script from a Visual Studio Developer Command Prompt
    exit /b 1
)

:: Create build directory
if not exist build mkdir build

:: Download OBS Studio
if not exist deps mkdir deps
cd deps
if not exist obs-studio (
    echo Cloning OBS Studio...
    git clone --recursive https://github.com/obsproject/obs-studio.git
    cd obs-studio
    git checkout 29.1.0
    cd ..
)

:: Build OBS Studio
cd obs-studio
if not exist build mkdir build
cd build

cmake -G "Visual Studio 17 2022" -A x64 ^
    -DCMAKE_INSTALL_PREFIX="%~dp0\obs-install" ^
    -DCMAKE_PREFIX_PATH="%~dp0\obs-install" ^
    -DENABLE_BROWSER=OFF ^
    -DENABLE_PLUGINS=OFF ^
    ..

cmake --build . --config Release --target install

cd ..\..\..

:: Configure plugin build
cd build
cmake -G "Visual Studio 17 2022" -A x64 ^
    -DOBS_SDK_PATH="%~dp0\deps\obs-studio\build\rundir\Release" ^
    ..

echo Environment setup complete!
echo You can now open the solution in Visual Studio or build from command line using:
echo cmake --build . --config Release

endlocal
