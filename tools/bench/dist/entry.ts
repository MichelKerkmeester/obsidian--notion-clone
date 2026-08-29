
import { installObsidianDomShim } from "../../storybook/obsidian-dom-shim.mjs";
import { runBench } from "../table-render-bench";

installObsidianDomShim(window);
window.__bench = (detached) => runBench(document.body, detached);
