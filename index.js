import utils from "../_utils"
import { sendNotification, Store } from "./requests"

/**
 * @author
 * Nome: Yan Gabriel    
 * Discord: Balaclava#1912 (854886148455399436)    
 * GitHub: https://github.com/controlado
 */

const buttonText = "Refund"
const buttonId = "refund-last-purchase"
const plugin = {
    "name": "Refund Last Purchase",
    "url": "https://github.com/controlado/refund-last-purchase",
    "version": "1.0.1",
}
export default plugin

function onMutation() {
    const championSelectButtons = document.querySelector(".bottom-right-buttons")
    if (!championSelectButtons || utils.phase !== "ChampSelect" || document.getElementById(buttonId)) { return }

    const store = new Store()

    const buyChampionButton = document.createElement("lol-uikit-flat-button")
    buyChampionButton.textContent = buttonText
    buyChampionButton.id = buttonId

    buyChampionButton.onclick = async () => {
        buyChampionButton.setAttribute("disabled", "true")
        try {
            const purchaseHistory = await store.getPurchaseHistory()
            const response = await store.refundLastChampion(purchaseHistory)
            const responseData = JSON.stringify(response.data)
            await sendNotification(responseData)
        }
        catch (error) { await sendNotification(error.message) }
        finally { buyChampionButton.removeAttribute("disabled") }
    }
    buyChampionButton.onmouseenter = () => { buyChampionButton.textContent = "Refund Last Champion" }
    buyChampionButton.onmouseleave = () => { buyChampionButton.textContent = buttonText }

    buyChampionButton.style.right = "19px"
    buyChampionButton.style.bottom = "57px"
    buyChampionButton.style.alignItems = "flex-end"
    buyChampionButton.style.position = "absolute"
    buyChampionButton.style.display = "flex"

    // compatibilidade com o plugin https://github.com/teisseire117/league-loader-plugins/tree/main/plugins/dodge_button
    const dodgeContainer = document.getElementsByClassName("dodge-button-container")
    if (dodgeContainer.length > 0) { buyChampionButton.style.bottom = "96px" }

    championSelectButtons.parentNode.insertBefore(buyChampionButton, championSelectButtons)
}

window.addEventListener("load", () => {
    console.debug(`${plugin.name}: Report bugs to Balaclava#1912`)
    utils.routineAddCallback(onMutation, ["bottom-right-buttons"])
})
