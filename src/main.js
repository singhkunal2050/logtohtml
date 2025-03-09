import { h, render } from "preact";
import LogWindowComponent from "./components/logWindow.jsx"; // PascalCase
import styles from "./styles/style.css"; // Import the CSS file


export default class LogWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.renderUI();
    console.log("Log Window Rendered");
  }

  renderUI() {
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = "";

    const styleNode = document.createElement("style");
    styleNode.textContent = styles;
    shadowRoot.appendChild(styleNode);
    render(<LogWindowComponent />, shadowRoot);
  }

}
