import { Component, createSignal } from 'solid-js';

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <button class="btn btn-primary"
      onClick={() => {
        setCount(count() + 1);
      }}
    >
      {count()}
    </button>
  );
};

export default App;
