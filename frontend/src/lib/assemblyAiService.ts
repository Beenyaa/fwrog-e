import axios from "axios";
import "dotenv";

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

  getTranscript = async () => {
    // Sends the audio file to AssemblyAI for transcription
    const response = await this.assembly.post("/transcript", {
      audio_url: this.audioURL,
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
        let transcriptText = transcript.data.text;
        console.log(`Your transcribed text:\n\n${transcriptText}`);
        clearInterval(checkCompletionInterval);
        return Promise.resolve(transcriptText);
      }
    }, this.refreshInterval);
  };
}
