import { Component, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import Nav from "./components/Nav";
import RecordingButton from "./components/RecordingButton";

type message = {
  user: string;
  msg: string;
};

function createStyles(user: string) {
  throw new Error("Function not implemented.");
}

function getStyles() {
  throw new Error("Function not implemented.");
}

export const App: Component = () => {
  let newUser, newMsg;
  const [state, setState] = createStore({
    messages: [],
  });

  return (
    <>
      <main class="flex flex-col place-items-center h-screen">
        <Nav></Nav>
        <div class=" flex flex-col h-screen w-4/5 justify-center -mt-8 mb-8">
          <div class="card lg:w-full/2 w-full bg-base-100">
            <div class="card-body justify-center mb-8 p-0">
              <div class="flex items-center justify-center rounded-lg">
                <div class="flex w-2/5 flex-row place-items-center justify-center">
                  <RecordingButton text="Record with WebSpeech API" />
                  <div class="divider lg:divider-horizontal">OR</div>
                  <RecordingButton text="Record with AssemblyAI" />
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
                <code>I am still largely WIP</code>
              </pre>
              <pre data-prefix=" bot:" class="text-primary">
                {" "}
                <code>me too</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
