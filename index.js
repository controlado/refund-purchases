import { sleep, addRoutines } from "../controladoUtils"
import { sendNotification, Store } from "./requests"

/**
 * @name refund-last-purchase
 * @author feminismo (balaclava)
 * @description Play with a champion for free! 🐧
 * @link https://github.com/controlado/refund-last-purchase
 */

const buttonConfig = {
    id: "refund-last-purchase",
    defaultMode: "refund",
    text: {
        default: "Refund",
        refund: "Refund Last Champion",
        buy: "Buy Last Refunded Champion",
    }
}
const plugin = {
    "name": "Refund Last Purchase",
    "url": "https://github.com/controlado/refund-last-purchase",
    "version": "1.0.1",
}

function onMutation() {
    const championSelectButtons = document.querySelector(".bottom-right-buttons")
    if (!championSelectButtons || document.getElementById(buttonConfig.id)) { return }

    const store = new Store()

    const buyChampionButton = document.createElement("lol-uikit-flat-button")
    buyChampionButton.setAttribute("style", "right: 19px; bottom: 57px; align-items: flex-end; position: absolute; display: flex;")
    buyChampionButton.textContent = buttonConfig.text.default
    buyChampionButton.mode = buttonConfig.defaultMode
    buyChampionButton.id = buttonConfig.id

    buyChampionButton.onclick = async () => {
        buyChampionButton.setAttribute("disabled", "true")
        const purchaseHistory = await store.getPurchaseHistory()
        try {
            if (buyChampionButton.mode === "refund") {
                const response = await store.refundLastChampion(purchaseHistory)
                await sendNotification(`Refund: ${response.statusText} (${response.status})`)
            } else {
                const item = purchaseHistory.find(item => item.currencyType === "IP" && item.inventoryType === "CHAMPION" && item.refundabilityMessage === "ALREADY_REFUNDED")
                const items = [
                    {
                        inventoryType: "CHAMPION",
                        ipCost: item.amountSpent,
                        itemId: item.itemId,
                        quantity: 1,

                    },
                ]
                const requestBody = { "accountId": store.summoner.accountId, "items": items }
                const response = await store.request("POST", "/storefront/v3/purchase", requestBody)
                await sendNotification(`Purchase: ${response.statusText} (${response.status})`)
            }
        }
        catch (error) { await sendNotification(error.message) }
        finally { buyChampionButton.removeAttribute("disabled") }
    }
    buyChampionButton.oncontextmenu = () => {
        buyChampionButton.mode = buyChampionButton.mode === "refund" ? "buy" : "refund"
        buyChampionButton.textContent = buttonConfig.text[buyChampionButton.mode]
    }
    buyChampionButton.onmouseenter = () => { buyChampionButton.textContent = buttonConfig.text[buyChampionButton.mode] }
    buyChampionButton.onmouseleave = () => { buyChampionButton.textContent = buttonConfig.text.default }

    sleep(1000).then(() => { // @teisseire117 - league-loader-plugins/dodge_button
        const dodgeContainer = document.getElementsByClassName("dodge-button-container")
        if (dodgeContainer.length > 0) { sendNotification("Identified dodge-button!"); buyChampionButton.style.bottom = "96px" }
        championSelectButtons.parentNode.insertBefore(buyChampionButton, championSelectButtons)
    })
}

window.addEventListener("load", () => {
    console.debug(`${plugin.name}: Report bugs to Balaclava#1912`)
    addRoutines(onMutation)
})
