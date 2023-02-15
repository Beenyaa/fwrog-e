import { createApp } from "solid-utils";
import { MetaProvider } from "@solidjs/meta";
import { App } from "./App";
import "./global.css";

createApp(App as (props?: {} | undefined) => Element)
  .use(MetaProvider)
  .mount("#root");
