import { h, render } from "preact";
import App from "./components/App.jsx";
import styles from "./styles/style.css";

export default class LogWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const styleNode = document.createElement("style");
    styleNode.textContent = styles;
    this.shadowRoot.appendChild(styleNode);
    render(<App />, this.shadowRoot);
  }
}
