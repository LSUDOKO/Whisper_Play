#include "audio-capture.hpp"
#include "webrtc-sender.hpp"

static const char *whisperplay_audio_capture_name(void *unused)
{
    UNUSED_PARAMETER(unused);
    return "WhisperPlay Audio Capture";
}

static void whisperplay_audio_capture_destroy(void *data)
{
    struct whisperplay_audio_source *context = static_cast<whisperplay_audio_source *>(data);
    if (context) {
        bfree(context);
    }
}

static void whisperplay_audio_capture_update(void *data, obs_data_t *settings)
{
    struct whisperplay_audio_source *context = static_cast<whisperplay_audio_source *>(data);
    const char *server_url = obs_data_get_string(settings, "server_url");
    
    if (server_url && server_url[0] != '\0') {
        initialize_webrtc_sender(server_url);
    }
}

static void *whisperplay_audio_capture_create(obs_data_t *settings, obs_source_t *source)
{
    struct whisperplay_audio_source *context = static_cast<whisperplay_audio_source *>(
        bzalloc(sizeof(struct whisperplay_audio_source)));
    
    context->source = source;
    context->channels = audio_output_get_channels(obs_get_audio());
    context->sample_rate = audio_output_get_sample_rate(obs_get_audio());
    
    whisperplay_audio_capture_update(context, settings);
    return context;
}

static void whisperplay_audio_capture_render(void *data, struct audio_data *audio)
{
    struct whisperplay_audio_source *context = static_cast<whisperplay_audio_source *>(data);
    if (!context || !audio) {
        return;
    }
    
    // Send audio data to WebRTC sender
    send_audio_data(audio->data[0], audio->frames * sizeof(float) * context->channels);
}

struct obs_source_info whisperplay_audio_capture_info = {
    .id = "whisperplay_audio_capture",
    .type = OBS_SOURCE_TYPE_INPUT,
    .output_flags = OBS_SOURCE_AUDIO,
    .get_name = whisperplay_audio_capture_name,
    .create = whisperplay_audio_capture_create,
    .destroy = whisperplay_audio_capture_destroy,
    .capture_audio = whisperplay_audio_capture_render
};
