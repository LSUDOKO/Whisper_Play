cmake_minimum_required(VERSION 3.16)
project(obs-whisperplay)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(LibObs REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(WebRTC REQUIRED)

set(obs-whisperplay_SOURCES
    src/plugin-main.cpp
    src/audio-capture.cpp
    src/webrtc-stream.cpp
    src/encryption.cpp
)

add_library(obs-whisperplay MODULE
    ${obs-whisperplay_SOURCES}
)

target_link_libraries(obs-whisperplay
    PRIVATE
    libobs
    OpenSSL::SSL
    OpenSSL::Crypto
    webrtc
)

target_include_directories(obs-whisperplay
    PRIVATE
    ${LibObs_INCLUDE_DIRS}
)
