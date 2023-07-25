import { addRoutines, linkEndpoint, sendChatNotification, sleep } from "https://cdn.skypack.dev/balaclava-utils@latest";
import { Store, Assets, Dropdown } from "./models";
import { version } from "../package.json";
import "./assets/style.css";

/**
 * @author balaclava
 * @name refund-purchases
 * @link https://github.com/controlado/refund-purchases
 * @description Play with a champion or skin for free! 🐧
 */

const store = new Store();
const assets = new Assets();
const dropdown = new Dropdown("Transactions", store, assets);

async function setupElements(selector, attribute) {
  const container = document.querySelector(selector);
  if (!container || container.hasAttribute(attribute)) { return; }
  container.setAttribute(attribute, "true");

  await store.wait();
  await assets.setItems();
  await dropdown.refreshOptions();

  await sleep(1000); // @teisseire117 - league-loader-plugins/dodge_button
  if (document.querySelector(".dodge-button-container")) {
    console.debug("refund-purchases: Dodge button detected!");
    sendChatNotification("Dodge button detected!");
    dropdown.element.style.bottom = "96px";
    dropdown.element.style.width = "260px";
  }

  container.appendChild(dropdown.element);
}

window.addEventListener("load", () => {
  linkEndpoint("/lol-inventory/v1/wallet", async parsedEvent => {
    if (parsedEvent.eventType === "Update") {
      console.debug("refund-purchases: Refreshing dropdown...");
      await store.wait();
      dropdown.refreshOptions();
    }
  });
  addRoutines(() => setupElements("div.champion-select", "refund-purchases"));
  console.debug(`refund-purchases(${version}): Report bugs to Balaclava#1912`);
});
