cmake_minimum_required(VERSION 3.16)
project(obs-whisperplay)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add path to custom CMake modules
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# Set OBS Studio source and build directories
if(DEFINED ENV{OBSSTUDIO_ROOT})
    set(OBSSTUDIO_ROOT $ENV{OBSSTUDIO_ROOT})
else()
    set(OBSSTUDIO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../obs-studio")
endif()

set(LIBOBS_SOURCE_DIR "${OBSSTUDIO_ROOT}")
set(LIBOBS_BUILD_DIR "${OBSSTUDIO_ROOT}/build")
set(LIBOBS_INCLUDE_DIR "${OBSSTUDIO_ROOT}/libobs")

# Add LibObs and dependencies paths
list(APPEND CMAKE_PREFIX_PATH 
    "${LIBOBS_BUILD_DIR}"
    "${LIBOBS_BUILD_DIR}/libobs"
    "${LIBOBS_BUILD_DIR}/deps/w32-pthreads"
)

# Find required packages
find_package(LibObs REQUIRED)
find_package(OpenSSL REQUIRED)

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
