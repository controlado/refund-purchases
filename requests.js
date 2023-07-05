import { credentials, request, StoreBase } from "../controladoUtils";

/**
 * @author balaclava
 * @name refund-last-purchase
 * @link https://github.com/controlado/refund-last-purchase
 * @description Play with a champion for free! 🐧
 */

/**
 * Envia uma notificação no chat da seleção de campeões.
 *
 * @async
 * @function
 * @param {string} notification - Notificação que vai ser enviada.
 * @return {Promise<Response>} Resposta da requisição.
 */
export async function sendNotification(notification) {
  const { participants } = await getChampionSelectParticipants();
  const { cid } = participants[0];

  const requestBody = { body: notification, type: "celebration" };
  const endpoint = `/lol-chat/v1/conversations/${cid}/messages`;
  const response = await request("POST", endpoint, { body: requestBody });
  return await response.json();
}

async function getChampionSelectParticipants() {
  const authToken = btoa(`riot:${credentials.auth}`);
  const requestHeaders = { Authorization: `Basic ${authToken}` };
  const url = `https://127.0.0.1:${credentials.port}/chat/v5/participants/champ-select`;
  const response = await request("GET", url, { headers: requestHeaders });
  return await response.json();
}

export class Store extends StoreBase {
  /**
   * Tenta reembolsar o último campeão.
   *
   * @async
   * @function
   * @summary Deve ser chamada após a conclusão do {@link auth}.
   * @param {Object[]} purchaseHistory - Obtido através do {@link getPurchaseHistory}.
   * @return {Promise<Response>} Resposta da tentativa de requisição enviada.
   */
  async refundLastChampion(purchaseHistory) {
    const champions = purchaseHistory.filter(purchase => purchase.inventoryType === "CHAMPION");
    if (champions.length) {
      const body = {
        inventoryType: "CHAMPION",
        transactionId: champions[0]["transactionId"],
        accountId: this.summoner.accountId,
      };
      return await this.request("POST", "/storefront/v3/refund", body);
    }
  }

  /**
   * Retorna o histórico de compras do jogador autenticado.
   *
   * @async
   * @function
   * @summary Deve ser chamada após a conclusão do {@link auth}.
   * @return {Promise<Object[]>} Histórico de transações do jogador.
   */
  async getPurchaseHistory() {
    const response = await this.request("GET", "/storefront/v3/history/purchase");
    return response.data.transactions;
  }
}
