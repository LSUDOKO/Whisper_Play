@echo off
echo Setting up OBS Studio development environment...

:: Create and navigate to obs-studio directory
cd ..
if not exist obs-studio (
    echo Cloning OBS Studio...
    git clone --recursive https://github.com/obsproject/obs-studio.git
)

:: Build OBS Studio
cd obs-studio
if not exist build mkdir build
cd build

echo Building OBS Studio...
cmake -G "Visual Studio 17 2022" -A x64 ..
cmake --build . --config Release

echo OBS Studio build complete.
cd ../../obs-plugin/build

echo Configuring WhisperPlay plugin...
cmake -G "Visual Studio 17 2022" -A x64 ..

echo Setup complete! You can now build the plugin with:
echo cmake --build . --config Release
