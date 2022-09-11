import { createSignal } from "solid-js";

export const App = () => {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div class="navbar bg-success text-accent-content">
        <a class="btn btn-ghost normal-case text-xl font-mono">
          FWROG-E
        </a>
      </div>
      <main>
        <form>
          <label for="chat" class="sr-only">
            Your message
          </label>
          <div class="flex items-center py-2 px-3 rounded-lg">
            <input class="block mx-4 p-2.5 w-full input input-bordered"  placeholder="Your message..." readonly></input>
            <button
              type="submit"
              class="inline-flex justify-center p-2 text-blue-500 btn btn-ghost"
            >
              <svg
                class="w-6 h-6 rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </form>
        <div class="flex flex-col w-full lg:flex-row">
          <button
            class="grid flex-grow h-16 btn btn-primary place-items-center"
          >
            Try with WebSpeech API
          </button>
          <div class="divider lg:divider-horizontal">OR</div>
          <button
            class="grid flex-grow h-16 btn btn-info place-items-center"
          >
            Try with AssemblyAI
          </button>
        </div>
      </main>
    </>
  );
};

export default App;
