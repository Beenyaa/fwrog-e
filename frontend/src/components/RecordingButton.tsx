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
  const [buttonState, setButtonState] = createSignal("glass");
  const [textState, setTextState] = createSignal("Record with ");

  const toggleButtonState = () => {
    if (recordingState) {
      setButtonState("btn-error");
      setTextState("Stop Recording ");
    } else {
      setButtonState("glass");
      setTextState("Record with ");
    }
    functionality();
  };

  return (
    <button
      onClick={() => toggleButtonState()}
      class={`grid flex-grow h-16 w-full max-w-sm btn ${buttonState()} place-items-center hover:shadow-inner shadow-xl shadow-gray-500/50`}
    >
      <p>{textState() + text}</p>
    </button>
  );
};

export default RecordingButton;
