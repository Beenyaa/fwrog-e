import { Component, createSignal } from "solid-js";
import Modal from "./components/Modal/Modal";
import WhisperService from "./integrations/whisper/main";

import microphoneTurnOn from "./static/fwrog-e-smiling.svg";
import microphoneTurnOff from "./static/fwrog-e.svg";
import FWROGE_WEBP from "./static/fwrog-e-3d-square.webp";

export const App: Component = () => {
  const [transcription, setTranscription] = createSignal("");
  const [reasoning, setReasoning] = createSignal("");
  const [messages, setMessages] = createSignal();
  new WhisperService().run((t, r) => {
    setTranscription(t);
    setReasoning(r);
    setMessages([...(messages() as []), transcription() || reasoning()]);
    console.log("messages:", messages);
  });

  console.log(transcription());

  return (
    <>
      {/* <Modal children={undefined}></Modal> */}
      <main class="flex flex-col place-items-center h-screen w-screen">
        <div class=" flex flex-col h-screen w-4/5 justify-center -mt-8 mb-8">
          <div id="messages" class="">
            <div
              class="mockup-code bg-neutral overflow-auto shadow-xl shadow-gray-500/50"
              style="height: 46rem; max-height: 46rem;"
            >
              <pre data-prefix="" class="text-primary">
                <div class="chat chat-end">
                  <div class="chat-image avatar">
                    <div class="w-12 rounded-full">
                      {/* <img src={microphoneTurnOn} /> */}
                      <span class=" bg-primary" />
                    </div>
                  </div>
                  <div class="chat-header">USER</div>
                  <div class="chat-bubble bg-base-100 text-black">
                    {" "}
                    <code>{transcription() || "..."}</code>
                  </div>
                </div>
              </pre>
              <pre data-prefix="" class="text-success">
                <div class="chat chat-start">
                  <div class="chat-image avatar">
                    <div class="w-12 rounded-full">
                      <img src={FWROGE_WEBP} />
                    </div>
                  </div>
                  <div class="chat-header">FWROG-E</div>
                  <div class="chat-bubble bg-base-100 text-black">
                    {" "}
                    <code>{reasoning() || "..."}</code>
                  </div>
                </div>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
