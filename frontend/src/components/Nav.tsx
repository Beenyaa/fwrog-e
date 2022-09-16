import { Component } from "solid-js";
import fwroge from "../static/fwrog-e.svg";

const Nav: Component = () => {
  return (
    <nav class="navbar bg-neutral justify-center text-success mb-8">
      <a class="flex flex-row btn btn-ghost normal-case text-2xl font-mono">
        <img class="h-8" src={fwroge} alt="FWROG-E logo" /> FWROG-E
      </a>
    </nav>
  );
};

export default Nav;
