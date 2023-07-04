import { StoreBase, credentials } from "../controladoUtils"

/**
 * @name refund-last-purchase
 * @author feminismo (balaclava)
 * @description Play with a champion for free! 🐧
 * @link https://github.com/controlado/refund-last-purchase
 */

export async function sendNotification(notification) {
    const { participants } = await getChampionSelectParticipants()
    const { cid } = participants[0]

    const requestParams = {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        },
        body: JSON.stringify(
            {
                body: notification,
                type: "celebration"
            }
        )
    }
    const endpoint = `/lol-chat/v1/conversations/${cid}/messages`
    const response = await fetch(endpoint, requestParams)
    return await response.json()
}

export async function getChampionSelectParticipants() {
    const authToken = btoa(`riot:${credentials.auth}`)
    const requestParams = {
        method: "GET",
        headers: {
            Authorization: `Basic ${authToken}`
        }
    }
    const url = `https://127.0.0.1:${credentials.port}/chat/v5/participants/champ-select`
    const response = await fetch(url, requestParams)
    return await response.json()
}

export class Store extends StoreBase {
    /**
     * Tenta reembolsar o último campeão.
     * 
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do {@link auth}.
     * @param {JSON[]} purchaseHistory - Obtido através do {@link getPurchaseHistory}.
     * @return {Promise<Response>} Resposta da tentativa de requisição enviada.
     */
    async refundLastChampion(purchaseHistory) {
        const champions = purchaseHistory.filter(purchase => purchase.inventoryType === "CHAMPION")
        if (champions.length === 0) { return }

        const body = {
            accountId: this.summoner.accountId,
            transactionId: champions[0]["transactionId"],
            inventoryType: "CHAMPION"
        }
        return await this.request("POST", "/storefront/v3/refund", body)
    }

    /**
     * Retorna o histórico de compras do jogador autenticado.
     * 
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do {@link auth}.
     * @return {Promise<JSON[]>} Histórico de transações do jogador.
     */
    async getPurchaseHistory() {
        const response = await this.request("GET", "/storefront/v3/history/purchase")
        return response.data.transactions
    }
}