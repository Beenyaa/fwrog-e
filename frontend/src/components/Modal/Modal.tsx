import {
  Component,
  JSX,
  createSignal,
  createEffect,
  onCleanup,
  Show,
  children,
} from "solid-js";

type ModalProps = {
  children: JSX.Element;
};

const Modal: Component<ModalProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);

  createEffect(() => {
    if (isOpen()) {
      const focusTrap = (e: KeyboardEvent) => {
        const { key, code } = e;
        const isEscapePressed = (key || code) === "Escape";
        if (isEscapePressed) return setIsOpen(false);
      };
      onCleanup(() => {
        document.removeEventListener("keydown", focusTrap);
      });
    }
  });

  return (
    <Show
      when={isOpen()}
      fallback={
        <button
          type="button"
          class="btn btn-ghost"
          onClick={() => setIsOpen(true)}
        >
          Guide
        </button>
      }
      children={
        <div
          class="modal"
          role="presentation"
          onClick={() => setIsOpen(false)}
          // onKeyPress={(e) =>
          //   (e.key || e.code) === "Escape" ? setIsOpen(false) : null
          // }
        >
          <div class="modal-box">
            <h3 class="font-bold text-lg">
              Congratulations random Internet user!
            </h3>
            <p class="py-4">{props.children}</p>
            <div class="modal-action">
              <button class="btn" onClick={() => setIsOpen(false)}>
                Let's Go!
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default Modal;
