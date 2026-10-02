import { h } from "preact";
import ConsoleTab from "./console.jsx";
import NetworkTab from "./network.jsx";

export default function LogContent({ activeTab, filter, search }) {
  return (
    <div id="log-content">
      {activeTab === "console" && <ConsoleTab filter={filter} search={search} />}

      {activeTab === "network" && <NetworkTab filter={filter} search={search} />}
    </div>
  );
}
