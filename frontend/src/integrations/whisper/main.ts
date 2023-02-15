import RecordRTC, { StereoAudioRecorder } from "recordrtc";

new RTCPeerConnection().createOffer();

type Conversation = {
  status: "connection_established" | "no_speech" | "broadcasting";
  transcription?: string;
  reasoning?: string;
};

export default class WhisperService {
  // private realtimeSessionToken;
  private socket: WebSocket;
  private recorder: RecordRTC;
  private wsURL: string;

  constructor() {
    this.wsURL = import.meta.env.VITE_WEBSOCKET_SERVER_URL;
  }

  run = (callback: (transcription: string, reasoning: string) => void) => {
    if (this.socket) {
      this.socket.send(JSON.stringify({ terminate_session: true }));
      this.socket.close();
      this.socket = null;
    }

    if (this.recorder) {
      this.recorder.pauseRecording();
      this.recorder = null;
    }

    // establish wss with AssemblyAI at 16000 sample rate
    this.socket = new WebSocket(this.wsURL);
    // this.socket = new ws();

    // handle incoming messages to display transcription to the DOM
    let old_transcription = "";
    let old_reasoning = "";
    this.socket.onmessage = (message) => {
      const response: Conversation = JSON.parse(message.data.toString());
      console.log("response:", response);

      if (response.transcription) {
        old_transcription = response.transcription;
        callback(response.transcription, old_reasoning);
      }
      if (response.reasoning) {
        old_reasoning = response.reasoning;
        callback(old_transcription, response.reasoning);
      }
      callback(old_transcription, old_reasoning);
    };

    this.socket.onerror = (event) => {
      console.error(event);
      this.socket.close();
      callback("", "");
    };

    this.socket.onclose = (event) => {
      console.log(event);
      this.socket = null;
      this.recorder = null;
    };

    this.socket.onopen = () => {
      // once socket is open, begin recording
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 900,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob: Blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = <string>reader.result;

                // audio data must be sent as a base64 encoded string
                if (this.socket) {
                  this.socket.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  );
                }
              };
              reader.readAsDataURL(blob);
            },
          });

          this.recorder.startRecording();
        })
        .catch((err) => console.error(err));
    };
  };
}
