import { addRoutines, addCssLink, linkEndpoint, sendChatNotification, sleep } from "https://cdn.skypack.dev/balaclava-utils@latest";
import { Store, Assets, Dropdown } from "./models";
import "./assets/style.css";

/**
 * @author balaclava
 * @name refund-purchases
 * @link https://github.com/controlado/refund-purchases
 * @description Play with a champion or skin for free! 🐧
 */

const store = new Store();
const assets = new Assets();
const dropdown = new Dropdown(store, assets);

async function setupElements(selector, attribute) {
  const container = document.querySelector(selector);
  if (!container || container.hasAttribute(attribute)) { return; }
  container.setAttribute(attribute, "true");

  await store.wait();
  await assets.setItems();
  await dropdown.refreshOptions();

  await sleep(1000); // @teisseire117 - league-loader-plugins/dodge_button
  if (document.querySelector(".dodge-button-container")) {
    sendChatNotification("Dodge button detected!");
    dropdown.element.style.bottom = "96px";
    dropdown.element.style.width = "260px";
  }

  container.appendChild(dropdown.element);
}

window.addEventListener("load", () => {
  addCssLink("https://cdn.skypack.dev/refund-purchases@latest/dist/assets/index.css");
  linkEndpoint("/lol-inventory/v1/wallet", async parsedEvent => {
    if (parsedEvent.eventType === "Update") {
      await store.wait();
      dropdown.refreshOptions();
    }
  });
  addRoutines(() => {
    setupElements("div.champion-select", "refund-purchases");
  });
});
