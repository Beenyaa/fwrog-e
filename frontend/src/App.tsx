import { Component, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import Nav from "./components/Nav";
import RecordingButton from "./components/RecordingButton";
import AssemblyAIService from "./lib/assemblyAiService";
import SpeechRecognitionService from "./lib/webSpeechRecognitionService";

type IState = {
  recording: boolean;
  result?: string;
};

export const App: Component = () => {
  const [state, setState] = createSignal({
    recording: false,
    result: "",
  } as IState);
  const recognition = new SpeechRecognitionService();
  const assemblyAi = new AssemblyAIService();
  const startRecording = () => {
    recognition.onResult((result) => {
      setState({ result });
    });
    recognition.onEnd(() => {
      setState({ recording: false });
    });
    recognition.start();
    setState({ recording: true });
  };
  const stopRecording = () => {
    setState({ recording: false });
    recognition.stop();
  };

  const toggleWebSpeechRecording = () => {
    console.log(state().recording);
    state().recording ? stopRecording() : startRecording();
  };

  const toggleRecording = async () => {
    const result = await assemblyAi.getTranscript();
    console.log("result:", result);
    setState({ result });
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
