import axios from "https://cdn.skypack.dev/axios"

/**
 * @author
 * Nome: Yan Gabriel    
 * Discord: Balaclava#1912 (854886148455399436)    
 * GitHub: https://github.com/controlado
 */

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
        if (champions.length === 0) { console.debug("jogador não possui compras de campeões"); return }

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
            "method": method,
            "headers": {
                "Authorization": `Bearer ${this.token}`
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