import { Component, createSignal } from "solid-js";
import Nav from "./components/Nav";
import RecordingButton from "./components/RecordingButton";
import AssemblyAIService from "./logic/AssemblyAiService";
import SpeechRecognitionService from "./logic/WebSpeechRecognitionService";
// import MediaStreamRecorder from "./logic/WebMediaRecorderService";

type IState = {
  result?: string;
  recording?: boolean;
};

export const App: Component = () => {
  const [state, setState] = createSignal({
    result: "",
    recording: false,
  } as IState);

  // const establishStream = async () => {
  //   const continousStream = navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //   });

  //   return new MediaStream(await continousStream);
  // };

  const recognition = new SpeechRecognitionService();
  const assemblyAi = new AssemblyAIService();
  // const stream = establishStream();
  // const webRecorder = new MediaStreamRecorder(stream);
  const startRecording = () => {
    recognition.onResult((result) => {
      setState({ result });
    });
    recognition.onEnd(() => {
      setState({ recording: false });
    });
    setState({ recording: true });
    recognition.start();
  };
  const stopRecording = () => {
    recognition.onEnd(() => {
      setState({ recording: false });
    });
    setState({ recording: false });
    recognition.stop();
  };

  const toggleWebSpeechRecording = () => {
    console.log("old recording state:", state().recording);
    state().recording ? stopRecording() : startRecording();
    console.log("new recording state:", state().recording);
  };

  const toggleRecording = async () => {
    await assemblyAi.getTranscript((result) => {
      setState({ result });
    });
  };

  return (
    <>
      <main class="flex flex-col place-items-center h-screen">
        <Nav></Nav>
        <div class=" flex flex-col h-screen w-4/5 justify-center -mt-8 mb-8">
          <div class="card lg:w-full/2 w-full bg-base-100">
            <div class="card-body justify-center mb-8 p-0">
              <div class="flex items-center justify-center rounded-lg">
                <div class="flex w-2/5 flex-row place-items-center justify-center">
                  <RecordingButton
                    text="WebSpeech API"
                    recordingState={state().recording}
                    functionality={async () => toggleWebSpeechRecording()}
                  />
                  <div class="divider lg:divider-horizontal">OR</div>
                  <RecordingButton
                    text="AssemblyAI"
                    recordingState={state().recording}
                    functionality={async () => toggleRecording()}
                  />
                </div>
              </div>
            </div>
          </div>
          <div id="messages" class="">
            <div
              class="mockup-code h-full overflow-auto shadow-xl shadow-gray-500/50"
              style="height: 26rem; max-height: 26rem;"
            >
              <pre data-prefix=" you:" class="text-success">
                {" "}
                <code>
                  {state().result ||
                    "I should now work with WebSpeech API on most browsers, my AssemblyAI functionality is WIP"}
                </code>
              </pre>
              <pre data-prefix=" bot:" class="text-primary">
                {" "}
                <code>I am a work in progress :\) </code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
