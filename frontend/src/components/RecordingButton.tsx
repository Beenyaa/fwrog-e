import { Component, createSignal } from "solid-js";
import microphoneTurnOn from "../static/fwrog-e-smiling.svg";
import microphoneTurnOff from "../static/fwrog-e.svg";

interface Props {
  // text: string;
  recordingState: boolean;
  onToggleRecording?: Function;
}

const RecordingButton: Component<Props> = ({
  // text,
  recordingState,
  onToggleRecording,
}) => {
  const [buttonState, setButtonState] = createSignal({
    class: "glass",
    image: microphoneTurnOn,
  });

  const toggleButtonState = async () => {
    if (buttonState().image === microphoneTurnOn) {
      setButtonState({ class: "glass", image: microphoneTurnOff });
      console.log(buttonState());
      onToggleRecording;
    } else {
      setButtonState({ class: "glass", image: microphoneTurnOn });
      console.log(buttonState());
    }
  };

  return (
    <div
      class="tooltip tooltip-right"
      style={"overflow-wrap: break-word;"}
      data-tip="press once to start recording your voice and press a second time to stop. "
    >
      <button
        onclick={toggleButtonState}
        class={`grid h-16 w-16 btn btn-circle ${
          buttonState().class
        } place-items-center hover:shadow-inner shadow-xl shadow-gray-500/50`}
      >
        <img src={buttonState().image} width="50" height="50" />
      </button>
    </div>
  );
};

export default RecordingButton;
