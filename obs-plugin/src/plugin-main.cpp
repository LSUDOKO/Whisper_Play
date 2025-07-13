#include <obs-module.h>
#include "audio-capture.hpp"

OBS_DECLARE_MODULE()
OBS_MODULE_USE_DEFAULT_LOCALE("obs-whisperplay", "en-US")

bool obs_module_load(void)
{
    blog(LOG_INFO, "WhisperPlay plugin loaded successfully");
    
    // Register the audio capture source
    obs_register_source(&whisperplay_audio_capture_info);
    
    return true;
}

void obs_module_unload()
{
    blog(LOG_INFO, "WhisperPlay plugin unloaded");
}
