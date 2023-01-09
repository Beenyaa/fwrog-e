from dataclasses import dataclass
import torch
import whisper
import re


@dataclass
class __AudioProcessingConfig:
    wake_words = ["Hey Froggy,", "Hey froggy", "Hey Froggy",
                  "Hey froggy,", "Hey, Froggy,", "Hey, froggy,",
                  "Hey Froggie,", "Hey, Froggie,", "Hey Froggie",
                  "Hey froggie", "Hey, froggie,", "Hey, froggie",
                  "Hey froggie,"]
    whisper_model = whisper.load_model(name='base', device="cpu")
    whisper_quantized_model = torch.quantization.quantize_dynamic(
        whisper_model, {torch.nn.Linear}, dtype=torch.qint8
    )
    message = ""


async def process_audio_data(audio_data) -> str | None:
    """
    Process the audio data and return the transcription result.
    """
    config = __AudioProcessingConfig()

    # Pad or trim the audio data
    audio = whisper.pad_or_trim(audio_data)

    # Compute log mel spectrogram
    mel = whisper.log_mel_spectrogram(audio).to(
        config.whisper_quantized_model.device)

    # Detect language
    _, probs = config.whisper_quantized_model.detect_language(mel)
    print('probs:', probs['en'])

    # Return None if probability of English is not between 0.60 and 1.0
    if not (0.40 <= probs['en'] <= 1.0):
        print('returning none')
        return None

    # Set decoding options
    options = whisper.DecodingOptions(
        language='en', task='transcribe', fp16=False).__dict__.copy()
    options['no_speech_threshold'] = 0.275
    options['logprob_threshold'] = None

    # Transcribe audio
    result = config.whisper_quantized_model.transcribe(
        audio, **options, verbose=False)
    print(result['text'])

    # Append transcribed text to message
    config.message += result['text']

    # Return cleaned text if wake word is present in message
    for wake_word in config.wake_words:
        if wake_word in config.message:
            return __clean_text(config.message, wake_word)

    # Reset message
    config.message = ""
    return None


def __clean_text(message, wake_word):
    """
    Remove wake word from message and return capitalized text.
    """
    message = re.findall(f"{wake_word}\s(.+)", message)[0]

    message = message.strip().capitalize()
    return message
