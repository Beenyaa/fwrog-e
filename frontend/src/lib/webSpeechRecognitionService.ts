export default class SpeechRecognitionService {
  private recognition: SpeechRecognition;

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;
  }

  onResult = (callback: (result: string, isFinal: boolean) => void) => {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!event.results) {
        return;
      }
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) {
        callback("...", false);
        return;
      }
      callback(lastResult[0].transcript, true);
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
