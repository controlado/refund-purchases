import axios from "https://cdn.skypack.dev/axios"
import { credentials } from "../controladoUtils"

/**
 * @author
 * Nome: Yan Gabriel    
 * Discord: Balaclava#1912 (854886148455399436)    
 * GitHub: https://github.com/controlado
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

export class Store {
    constructor() {
        this.url = null
        this.token = null
        this.summoner = null
        this.session = axios.create()
        this.auth()
    }

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
        const endpoint = "/storefront/v3/refund"
        return await this.request("POST", endpoint, body)
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
        const endpoint = "/storefront/v3/history/purchase"
        const response = await this.request("GET", endpoint)
        return response.data.transactions
    }

    /**
     * Faz uma requisição para a loja.
     *
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do {@link auth}.
     * @param {String} method - Método HTTP da requisição, como `GET`.
     * @param {String} endpoint - Endpoint da requisição para a loja.
     * @param {JSON} [requestBody] - Parâmetro opcional, corpo da requisição.
     * @return {Promise<Response>} Resposta da requisição.
     */
    async request(method, endpoint, requestBody = undefined) {
        const requestParams = {
            method: method,
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        }
        if (requestBody) { requestParams.data = requestBody }
        return await this.session.request(this.url + endpoint, requestParams)
    }

    /**
     * Autentica a classe, definindo os atributos da instância.
     * 
     * @async
     * @function
     * @summary Essa função deve ser chamada antes de utilizar a classe.
     */
    async auth() {
        this.url = await this.getStoreUrl()
        this.token = await this.getSummonerToken()
        this.summoner = await this.getSummonerData()
    }

    async getStoreUrl() {
        const endpoint = "/lol-store/v1/getStoreUrl"
        const response = await fetch(endpoint)
        return await response.json()
    }

    async getSummonerToken() {
        const endpoint = "/lol-rso-auth/v1/authorization/access-token"
        const response = await fetch(endpoint)
        const responseData = await response.json()
        return responseData.token
    }

    async getSummonerData() {
        const endpoint = "/lol-summoner/v1/current-summoner"
        const response = await fetch(endpoint)
        return await response.json()
    }
}