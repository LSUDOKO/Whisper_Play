#pragma once
#include <obs-module.h>

struct whisperplay_audio_source {
    obs_source_t *source;
    audio_t *audio;
    size_t channels;
    uint32_t sample_rate;
};

extern struct obs_source_info whisperplay_audio_capture_info;
