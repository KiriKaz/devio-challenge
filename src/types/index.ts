
export type Product = {
  /**
   * Product's short name.
   * @example
   * // For a product called "Espresso Filtrado"
   * "ESPFIL"
   *
   * @type {string}
   */
  _id: string,
  /**
   * Product's full name.
   * @example
   * "Espresso Filtrado"
   *
   * @type {string}
   */
  name: string,
  /**
   * Product's price.
   * @example
   * 4.95
   *
   * @type {number}
   */
  price: number
}

export type Order = {
  /**
   * Order ID.
   *
   * @type {mongoose.Types.ObjectId}
   */
  _id: string,

  /**
   * Whether or not an order is complete and ready for pickup.
   *
   * @type {boolean}
   */
  complete: boolean,

  /**
   * Client whose order it is.
   * @see {@link Client}
   *
   * @type {Client}
   */
  client: Client,

  /**
   * Products in the order.
   * @see {@link Product}
   *
   * @type {Product[]}
   */
  products: Product[],

  /**
   * Total to be paid for all products.
   * @see {@link Product}
   *
   * @type {number}
   */
  total: number,

  /**
   * Optional observation client may leave for the kitchen.
   * @example
   * "No pickles."
   *
   * @type {string}
   */
  observation?: string,
}

export type Cart = {
  /**
   * Products in cart.
   * @see {@link Product}
   *
   * @type {Product[]}
   */
  products: Product[],

  /**
   * Total due for all products in cart.
   * @see {@link Product}
   *
   * @type {number}
   */
  total: number,

  /**
   * Optional observation client may leave for the kitchen.
   * @example
   * "No pickles."
   *
   * @type {string}
   */
  observation?: string
}

export type Client = {
  /**
   * Client ID.
   *
   * @type {mongoose.Types.ObjectID}
   */
  _id: string,

  /**
   * Client full name.
   * @example
   * John Doe
   *
   * @type {string}
   */
  name: string,

  /**
   * Client's cart.
   * @see {@link Cart} and {@link Product}
   *
   * @type {Cart}
   */
  cart: Cart
}

/**
 * Interface for DB handling strategies.
 * 
 * @interface IDBHandlerStrategy
 */
export interface IDBHandlerStrategy {
  
  /**
   * Get all loaded products and their details.
   *
   * @returns {(Product[] | [])} All products in DB if there are any, otherwise, an empty array.
   * @memberof IDBHandlerStrategy
   */

  getProducts(): Promise<Product[]>

  /**
   * Get all orders registered.
   * 
   * @returns {(Order[] | [])} All orders in DB if there are any, otherwise, an empty array.
   * @memberof IDBHandlerStrategy
   */

  getCurrentOrders(): Promise<Order[]>

  /**
   * Get details about a specific order.
   * 
   * @param {string} reference Client name or client id linked to order
   * @returns {Order} Order details
   * @throws {OrderNotFound}
   * @memberof IDBHandlerStrategy
   */

  getDetailsAboutOrder(reference: string): Promise<Order>

  /**
   * Get details about loaded product. (Price, name, id)
   *
   * @param {string} reference id or name of product
   * @returns {Product} Product details
   * @throws {ProductNotFound}
   * @memberof IDBHandlerStrategy
   */
  getDetailsAboutProduct(reference: string): Promise<Product>

  
  /**
   * Add product to client's cart with reference to Product (name or id)
   * 
   * @param {string} clientRef Full client name or client id
   * @param {string} productRef id or name of product
   * @returns {Client} The client if modifying the cart was a success
   * @throws {ProductNotFound}
   * @memberof IDBHandlerStrategy
   */
  addProductToCartWithRef(clientRef: string, productRef: string): Promise<Client>
  
  /**
   * Removes a product from the client's cart.
   * 
   * @param {string} clientRef Full client name or client id
   * @param {string} productRef id or name of product
   * @returns {Client} The client if modifying the cart was a success
   * @throws {ProductNotFound}
   * @memberof IDBHandlerStrategy
   */
  removeProductFromCartWithRef(clientRef: string, productRef: string): Promise<Client>

  /**
   * Add product to client's cart with qualified instance of product as opposed to product identifier.
   * If the client doesn't exist, they're created.
   * 
   * @see {@link Product} for what can identify a product
   *
   * @param {string} clientRef Full client name or client id
   * @param {Product} product Instance of product to add
   * @returns {Client} The client if modifying the cart was a success
   * @memberof IDBHandlerStrategy
   */
  addProductToCart(clientRef: string, product: Product): Promise<Client>

  /**
   * Removes a product from the client's cart.
   * 
   * @param {string} clientRef Full client name or client id
   * @param {Product} product Instance of product to add
   * @returns {Client} The client if modifying the cart was a success
   * @throws {ClientNotFound}
   * @throws {ProductNotInCart}
   * @memberof IDBHandlerStrategy
   */
  removeProductFromCart(clientRef: string, product: Product): Promise<Client>

  /**
   * Mark an order as complete, for after it's been cooked and prepared for the client to take.
   * 
   * @param {string} reference Client name or client id linked to order
   * @returns {Order} The order if marking it as complete succeedeed
   * @throws {OrderNotFound}
   * @memberof IDBHandlerStrategy
   */
  markOrderAsComplete(reference: string): Promise<Order>

  /**
   * Mark an order as incomplete, in case the kitchen made a mistake, or the client wants a change in the order.
   *
   * @param {string} reference Client name or client id linked to order
   * @returns {Order} The order if marking it as complete succeedeed
   * @throws {OrderNotFound}
   * @memberof IDBHandlerStrategy
   */
  markOrderAsIncomplete(reference: string): Promise<Order>

  /**
   * Get a client's cart.
   *
   * @param {string} clientReference Client name or client id linked to order
   * @returns {Cart} The cart in question if the client was found
   * @throws {ClientNotFound}
   * @memberof IDBHandlerStrategy
   */
  getClientCurrentCart(clientReference: string): Promise<Cart>

  /**
   * 'Checks out' client's cart, marking it as an order.
   * @see {@link Order} for what the client's cart becomes
   *
   * @param {string} clientReference Client name or client id
   * @param {(string | undefined)} observation Observation for the kitchen
   * @returns {Order} The order if it was a success
   * @throws {ClientNotFound}
   * @throws {CartEmpty}
   * @memberof IDBHandlerStrategy
   */
  checkout(clientReference: string, observation: string | undefined): Promise<Order>

  /**
   * Modifies the {@link Order}'s observation to the kitchen if the order isn't marked as complete.
   *
   * @param {string} reference Order id or client name linked to order
   * @param {(string | null)} observation Observation for the kitchen
   * @returns {Order} The order if it was a success
   * @throws {OrderNotFound}
   * @throws {OrderComplete} If the order is already complete, you cannot modify its observation.
   * @memberof IDBHandlerStrategy
   */
  modifyOrderObservation(reference: string, observation: string | null): Promise<Order>
}