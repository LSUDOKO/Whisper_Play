# Setup script for OBS plugin development
Write-Host "Setting up development environment for WhisperPlay OBS plugin..."

# Check if Chocolatey is installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# Install required tools using Chocolatey
Write-Host "Installing required tools..."
choco install -y cmake
choco install -y visualstudio2022-workload-nativedesktop
choco install -y git

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Clone OBS Studio
Write-Host "Cloning OBS Studio..."
$obsPath = "..\obs-studio"
if (!(Test-Path $obsPath)) {
    git clone --recursive https://github.com/obsproject/obs-studio.git $obsPath
}

# Build OBS Studio
Write-Host "Building OBS Studio..."
Push-Location $obsPath
if (!(Test-Path "build")) {
    mkdir build
}
cd build
cmake -G "Visual Studio 17 2022" -A x64 ..
cmake --build . --config Release
Pop-Location

Write-Host "Setup complete! You can now build the WhisperPlay plugin."
Write-Host "Please restart your terminal to ensure all environment variables are updated."
