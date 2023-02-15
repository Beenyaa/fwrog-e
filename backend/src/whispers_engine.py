from ctypes import Array
from dataclasses import dataclass
import numpy as np
import torch
import whisper
import replicate
from scipy.io.wavfile import write


@dataclass
class __AudioProcessingConfig:
    # Load the pre-trained model from the repo and quantize it
    whisper_model = whisper.load_model(
        name='base', device="cpu")
    whisper_quantized_model = torch.quantization.quantize_dynamic(
        whisper_model, {torch.nn.Linear}, dtype=torch.qint8
    )
    # Load the VAD model
    vad_model, _ = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                  model='silero_vad')
    replicate_model = replicate.models.get('openai/whisper')
    version = replicate_model.versions.get(
        "30414ee7c4fffc37e260fcab7842b5be470b9b840f2b608f5baa9bbef9a259ed")


# Provided by Alexander Veysov
def _int2float(sound):
    # Normalizes the sound to a float from -1 to 1
    # Input: sound (np.array)
    # Output: sound (np.array)

    abs_max = np.abs(sound).max()
    sound = sound.astype('float32')
    if abs_max > 0:
        sound *= 1/abs_max
    sound = sound.squeeze()  # depends on the use case
    return sound


async def process_audio_data(audio_data: Array[np.int_], prompt: str = None) -> str:
    """
    Process the audio data and return the transcription result.
    """
    config = __AudioProcessingConfig()

    # Pad or trim the audio data

    audioFloat32 = _int2float(audio_data)

    # get the confidences and add them to the list to plot them later
    new_confidence = config.vad_model(
        torch.from_numpy(audioFloat32), 16000).item()
    # print('new_confidence:', new_confidence)

    if new_confidence > 0.5:
        # audio = whisper.pad_or_trim(audioFloat32)
        write("example.wav", 16000, audio_data.astype(np.int16))

        # options = whisper.DecodingOptions(
        #     language='en', task='transcribe', fp16=False).__dict__.copy()
        # options['no_speech_threshold'] = 0.275
        # options['logprob_threshold'] = None

        inputs = {
            # Audio file
            'audio': open("example.wav", "rb"),

            # Choose a Whisper model.
            'model': "small",

            # Choose the format for the transcription
            'transcription': "plain text",

            # Translate the text to English when set to True
            'translate': False,

            # language spoken in the audio, specify None to perform language
            # detection
            'language': 'en',

            # temperature to use for sampling
            'temperature': 0,

            # optional patience value to use in beam decoding, as in
            # https://arxiv.org/abs/2204.05424, the default (1.0) is equivalent to
            # conventional beam search
            # 'patience': ...,

            # comma-separated list of token ids to suppress during sampling; '-1'
            # will suppress most special characters except common punctuations
            'suppress_tokens': "-1",

            # optional text to provide as a prompt for the first window.
            # 'initial_prompt': ...,

            # if True, provide the previous output of the model as a prompt for
            # the next window; disabling may make the text inconsistent across
            # windows, but the model becomes less prone to getting stuck in a
            # failure loop
            'condition_on_previous_text': True,

            # temperature to increase when falling back when the decoding fails to
            # meet either of the thresholds below
            'temperature_increment_on_fallback': 0.2,

            # if the gzip compression ratio is higher than this value, treat the
            # decoding as failed
            'compression_ratio_threshold': 2.4,

            # if the average log probability is lower than this value, treat the
            # decoding as failed
            'logprob_threshold': -1,

            # if the probability of the <|nospeech|> token is higher than this
            # value AND the decoding has failed due to `logprob_threshold`,
            # consider the segment as silence
            'no_speech_threshold': 0.275,
        }

        if prompt:
            # prompt - sets the context of the window's transcription based from previous results
            inputs['prompt'] = prompt

        # Set decoding options

        # Transcribe audio
        # result = config.whisper_quantized_model.transcribe(
        #     audio, **options, verbose=False)
        result = config.version.predict(**inputs)
        print('result:', result)

        print(result)
        if result['segments'] and result['segments'][0]['no_speech_prob'] < 0.5:

            return result['transcription']
        else:
            return None

    return None
