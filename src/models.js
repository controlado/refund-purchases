import { waitShadowRoot, StoreBase } from "https://cdn.skypack.dev/balaclava-utils@latest";

/**
 * @author balaclava
 * @name refund-purchases
 * @link https://github.com/controlado/refund-purchases
 * @description Play with a champion or skin for free! 🐧
 */

export class Store extends StoreBase {
    validInventoryTypes = ["CHAMPION", "CHAMPION_SKIN"];

    refund(item) {
        const body = {
            inventoryType: item.inventoryType,
            transactionId: item.transactionId,
            accountId: this.summoner.accountId,
        };
        return this.request("POST", "/storefront/v3/refund", body);
    }

    async getTransactions() {
        const { data } = await this.request("GET", "/storefront/v3/history/purchase");
        return data.transactions.filter(transaction => this.validInventoryTypes.includes(transaction.inventoryType));
    }
}

export class Assets {
    constructor() {
        this.items = [];
    }

    async setItems() {
        const response = await fetch("/lol-game-data/assets/v1/skins.json");
        const responseData = await response.json();
        this.items = Object.values(responseData);

        for (const item of this.items) {
            item.id = item.isBase ? Math.floor(item.id / 1000) : item.id;
        }
    }

    getItemName(itemId) {
        const item = this.items.find(item => item.id == itemId);
        return item ? item.name : null;
    }
}

export class Dropdown {
    green = "#33CA72";
    yellow = "#F9BD0A";
    red = "#CA3336";

    constructor(text, store, assets) {
        this.element = document.createElement("lol-uikit-framed-dropdown");
        this.element.classList.add("dropdown-refund-items");

        this.text = text;
        this.store = store;
        this.assets = assets;
        this.transactions = null;
    }

    addOption(text, callback, { color } = {}) {
        const option = document.createElement("lol-uikit-dropdown-option");
        option.setAttribute("slot", "lol-uikit-dropdown-option");
        option.addEventListener("click", callback);
        option.innerText = text;

        option.shadowRoot?.
            querySelector("div")?.
            style.setProperty("color", color);

        this.element.appendChild(option);
    }

    setupOptions() {
        for (const transaction of this.transactions) {
            const refundable = transaction.refundable || transaction.refundabilityMessage === "TOO_SOON_TO_REFUND";
            const color = refundable ? (transaction.requiresToken === undefined ? this.yellow : this.green) : this.red;

            this.addOption(
                this.assets.getItemName(transaction.itemId),
                () => this.store.refund(transaction),
                { color }
            );
        }

        waitShadowRoot(this.element).then(shadowRoot => {
            if (!shadowRoot.querySelector("#controlado-placeholder")) {
                const placeholderContainer = shadowRoot.querySelector(".ui-dropdown-current");
                const placeholder = this.getNewPlaceholder();
                placeholderContainer.appendChild(placeholder);
            }
        });
    }

    getNewPlaceholder() {
        const placeholder = document.createElement("div");
        placeholder.classList.add("ui-dropdown-current-content");
        placeholder.style = "overflow: visible; text-align: end;";
        placeholder.id = "controlado-placeholder";
        placeholder.innerText = this.text;
        return placeholder;
    }

    async refreshOptions() {
        this.transactions = await this.store.getTransactions();
        this.element.innerHTML = "";
        this.setupOptions();
    }
}