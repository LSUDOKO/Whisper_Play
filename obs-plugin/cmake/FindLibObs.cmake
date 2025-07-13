# Find LibObs
#
# This module defines:
#  LIBOBS_FOUND, if false, do not try to link
#  LIBOBS_LIBRARIES, path to the libobs library
#  LIBOBS_INCLUDE_DIR, where to find libobs headers
#  LIBOBS_VERSION_STRING, the version of libobs found

find_package(PkgConfig QUIET)

# First try the official package config
find_package(LibObs QUIET CONFIG)

if(LibObs_FOUND)
    return()
endif()

# Look for libobs
find_path(LIBOBS_INCLUDE_DIR
    NAMES obs.h
    HINTS
        ENV obsPath${_lib_suffix}
        ENV obsPath
        ${obsPath}
        ${LIBOBS_SOURCE_DIR}
    PATHS
        /usr/include/obs
        /usr/local/include/obs
        ../obs-studio/libobs
    PATH_SUFFIXES
        libobs
)

find_library(LIBOBS_LIB
    NAMES obs libobs
    HINTS
        ENV obsPath${_lib_suffix}
        ENV obsPath
        ${obsPath}
        ${LIBOBS_BUILD_DIR}
    PATHS
        /usr/lib
        /usr/local/lib
        ../obs-studio/build/libobs
        ../obs-studio/build/libobs/Debug
        ../obs-studio/build/libobs/RelWithDebInfo
        ../obs-studio/build/libobs/Release
    PATH_SUFFIXES
        lib${_lib_suffix} lib
        libs${_lib_suffix} libs
        bin${_lib_suffix} bin
        ../lib${_lib_suffix} ../lib
        ../libs${_lib_suffix} ../libs
        ../bin${_lib_suffix} ../bin
)

# Try to find version
if(LIBOBS_INCLUDE_DIR)
    if(EXISTS "${LIBOBS_INCLUDE_DIR}/obs-version.h")
        file(STRINGS "${LIBOBS_INCLUDE_DIR}/obs-version.h" _obs_version_str
            REGEX "^#[\t ]*define[\t ]+OBS_VERSION[\t ]+\"([0-9]+\\.[0-9]+\\.[0-9]+)\"")
        string(REGEX REPLACE "^.*OBS_VERSION[\t ]+\"([0-9]+\\.[0-9]+\\.[0-9]+)\".*$" "\\1"
            LIBOBS_VERSION_STRING "${_obs_version_str}")
        unset(_obs_version_str)
    endif()
endif()

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(LibObs
    FOUND_VAR LIBOBS_FOUND
    REQUIRED_VARS LIBOBS_LIB LIBOBS_INCLUDE_DIR
    VERSION_VAR LIBOBS_VERSION_STRING)

if(LIBOBS_FOUND)
    set(LIBOBS_LIBRARIES ${LIBOBS_LIB})
    mark_as_advanced(LIBOBS_INCLUDE_DIR LIBOBS_LIB)
endif()
