import { Component, createSignal } from "solid-js";

interface Props {
  text: string;
  recordingState: boolean;
  functionality?: () => {};
}

const RecordingButton: Component<Props> = ({
  text,
  recordingState,
  functionality,
}) => {
  const [buttonState, setButtonState] = createSignal({ class: "glass" });
  const [textState, setTextState] = createSignal({ text: "Record with " });

  const toggleButtonState = () => {
    if (recordingState === true) {
      setButtonState({ class: "btn-error" });
      setTextState({ text: "Stop Recording " });
      console.log(buttonState());
      console.log(textState());
    } else {
      setButtonState({ class: "glass" });
      setTextState({ text: "Record with " });
      console.log(buttonState());
      console.log(textState());
    }
    functionality();
  };

  functionality()

  return (
    <button
      onMouseUp={() => toggleButtonState()}
      class={`grid flex-grow h-16 w-full max-w-sm btn ${
        buttonState().class
      } place-items-center hover:shadow-inner shadow-xl shadow-gray-500/50`}
    >
      <p>{textState().text + text}</p>
    </button>
  );
};

export default RecordingButton;
