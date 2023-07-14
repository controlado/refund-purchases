import { StoreBase } from "../controladoUtils";

/**
 * @author balaclava
 * @name refund-last-purchase
 * @link https://github.com/controlado/refund-last-purchase
 * @description Play with a champion for free! 🐧
 */

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
