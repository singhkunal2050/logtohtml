import { h } from "preact";
import { useViewport } from "./hooks.js";
import { deviceInfo, deviceInfoText } from "../utils/device.js";
import { copyText } from "../utils/clipboard.js";

export default function DeviceTab({ version, notify }) {
  useViewport(); // re-render on resize/rotation so sizes stay current
  const sections = deviceInfo(version);

  return (
    <div class="tab-body">
      <div class="list">
        {sections.map(([title, items]) => (
          <div class="kv-section device-section" key={title}>
            <div class="kv-title">{title}</div>
            {items.map(([k, v]) => (
              <div class="kv" key={k}>
                <span class="kv-k">{k}</span>
                <span class="kv-v mono">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div class="footer-actions">
        <button class="btn" onClick={async () => notify((await copyText(deviceInfoText(version))) ? "Device info copied" : "Copy failed")}>
          Copy device info
        </button>
      </div>
    </div>
  );
}
