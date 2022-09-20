import axios from "axios";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";

export default class AssemblyAIService {
  private realtimeSessionToken;
  private APIKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
  private isRecording = false;
  private socket: WebSocket;
  private recorder;

  constructor() {
    // Setting up the AssemblyAI headers
    try {
      this.realtimeSessionToken = axios.create({
        baseURL: "https://api.assemblyai.com/v2",
        headers: {
          authorization: this.APIKey,
          "content-type": "application/json",
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  run = (callback: (result: string, recording: boolean) => void) => {
    if (this.isRecording) {
      if (this.socket) {
        this.socket.send(JSON.stringify({ terminate_session: true }));
        this.socket.close();
        this.socket = null;
      }

      if (this.recorder) {
        this.recorder.pauseRecording();
        this.recorder = null;
      }
    }

    // establish wss with AssemblyAI at 16000 sample rate
    this.socket = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${this.realtimeSessionToken}`
    );

    // handle incoming messages to display transcription to the DOM
    const texts = {};
    this.socket.onmessage = (message) => {
      let msg = "";
      const res = JSON.parse(message.data);
      texts[res.audio_start] = res.text;
      const keys = Object.keys(texts);
      keys.sort((a: any, b: any) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`;
        }
      }
      callback(msg, true);
    };

    this.socket.onerror = (event) => {
      console.error(event);
      this.socket.close();
      callback("", false);
    };

    this.socket.onclose = (event) => {
      console.log(event);
      this.socket = null;
    };

    this.socket.onopen = () => {
      // once socket is open, begin recording
      callback("", false);
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 250, // set 250 ms intervals of data that sends to AAI
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
