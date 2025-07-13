# FindWebRTC.cmake
find_path(WEBRTC_INCLUDE_DIR
    NAMES webrtc/api/peer_connection_interface.h
    PATHS
        ${WEBRTC_ROOT}/include
        $ENV{WEBRTC_ROOT}/include
)

find_library(WEBRTC_LIBRARY
    NAMES webrtc webrtc_full
    PATHS
        ${WEBRTC_ROOT}/lib
        $ENV{WEBRTC_ROOT}/lib
)

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(WebRTC
    REQUIRED_VARS
        WEBRTC_LIBRARY
        WEBRTC_INCLUDE_DIR
)

if(WebRTC_FOUND)
    set(WEBRTC_LIBRARIES ${WEBRTC_LIBRARY})
    set(WEBRTC_INCLUDE_DIRS ${WEBRTC_INCLUDE_DIR})
endif()
