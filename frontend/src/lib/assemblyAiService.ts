import axios from "axios";

async function audioToBase64(audioFile) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(audioFile);
  });
}

export default class AssemblyAIService {
  private assembly;
  private audioURL = "https://bit.ly/3yxKEIY";
  private APIKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
  private refreshInterval = 5000;

  constructor() {
    // Setting up the AssemblyAI headers
    this.assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        authorization: this.APIKey,
        "content-type": "application/json",
      },
    });
  }

  getTranscript = async (
    callback: (result: string, recording: boolean) => void
  ) => {
    let transcriptText: string;
    // Sends the audio file to AssemblyAI for transcription
    const response = await this.assembly.post("/stream", {
      audio_data: audioToBase64(this.audioURL).then((result) =>
        console.log(result)
      ),
    });

    // Interval for checking transcript completion
    const checkCompletionInterval = setInterval(async () => {
      const transcript = await this.assembly.get(
        `/transcript/${response.data.id}`
      );
      const transcriptStatus = transcript.data.status;

      if (transcriptStatus !== "completed") {
        console.log(`Transcript Status: ${transcriptStatus}`);
      } else if (transcriptStatus === "completed") {
        console.log("\nTranscription completed!\n");
        transcriptText = transcript.data.text;
        console.log(`Your transcribed text:\n\n${transcriptText}`);
        clearInterval(checkCompletionInterval);
        callback("...", false);
        return;
      }
      callback(transcriptText, true);
    }, this.refreshInterval);
  };
}
