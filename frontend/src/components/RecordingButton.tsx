import { Component, createSignal } from "solid-js";

interface Props {
  text: string;
}

const RecordingButton: Component<Props> = ({ text }) => {
  const [recordingStates, setRecordingStates] = createSignal({
    class: "glass",
    isHidden: false,
  });

  const changeRecordingState = () => {
    setRecordingStates({ class: "loading", isHidden: true });
  };

  return (
    <button
      onclick={changeRecordingState()}
      class={`grid flex-grow h-16 w-full max-w-sm btn ${
        recordingStates().class
      } place-items-center shadow-xl shadow-gray-500/50`}
    >
      <p hidden={recordingStates().isHidden}>{text}</p>
    </button>
  );
};

export default RecordingButton;
