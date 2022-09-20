import { SpeechRecognition, SpeechRecognitionEvent } from "./WebSpeech.types";

export default class SpeechRecognitionService {
  private recognition: SpeechRecognition;

  constructor() {
    this.recognition = new (window as any).webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;
  }

  onResult = (callback: (result: string, recording: boolean) => void) => {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!event.results) {
        callback("", false);
        return;
      }
      const lastResult = event.results[event.results.length - 1];
      console.log(lastResult);
      if (!lastResult.isFinal) {
        callback(lastResult[0].transcript, true);
        return;
      }
      callback(lastResult[0].transcript, false);
    };
  };

  onEnd = (callback: () => void) => {
    console.log("SpeechRecognition.onend");
    this.recognition.onend = () => callback();
  };

  start = () => {
    console.log("SpeechRecognition.start");
    this.recognition.start();
  };

  stop = () => {
    console.log("SpeechRecognition.stop");
    this.recognition.stop();
  };
}
