
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
   * Saves the data to the DB the strategy handles explicitly. Depending on the strategy, this is done regularly, or does nothing.
   * 
   * @returns {void} void
   */
  save(): Promise<void>
  
  /**
   * Get all loaded products and their details.
   *
   * @returns {(Product[] | [])} All products in DB if there are any, otherwise, an empty array.
   */

  getProducts(): Promise<Product[]>

  /**
   * Get all orders registered.
   * 
   * @returns {(Order[] | [])} All orders in DB if there are any, otherwise, an empty array.
   */

  getCurrentOrders(): Promise<Order[]>

  /**
   * Get details about a specific order.
   * 
   * @param {string} reference Client name or client id linked to order
   * @returns {(Order | false)} Order details if it's found, otherwise, false
   */

  getDetailsAboutOrder(reference: string): Promise<Order | false>

  /**
   * Get details about loaded product. (Price, name, id)
   *
   * @param {string} reference id or name of product
   * @returns {Product} if product is in DB
   * @returns {false} if product is not in DB
   * @memberof IDBHandlerStrategy
   */
  getDetailsAboutProduct(reference: string): Promise<Product | false>

  
  /**
   * Add product to client's cart with qualified instance of product as opposed to product identifier.
   * @see {@link Product}I  for what can identify a product
   *
   * @param {string} client Full client name
   * @param {Product} product Instance of product to add
   * @returns {true} true if adding product to cart was a success
   * @returns {false} false if adding product to cart failed
   * @memberof IDBHandlerStrategy
   */
  addProductToCart(client: string, product: Product): Promise<boolean>

  /**
   * Add product to client's cart with reference to Product (name or id)
   * 
   * @param {string} client Full client name
   * @param {string} productRef id or name of product
   * @returns {true} True if adding product to cart was a success
   * @returns {false} False if adding product to cart failed
   * @returns {-1} -1 if product wasn't found
   * @memberof IDBHandlerStrategy
   */
  addProductToCartWithRef(client: string, productRef: string): Promise<boolean | -1>

  /**
   * Mark an order as complete, for after it's been cooked and prepared for the client to take.
   * 
   * @param {string} reference Client name or client id linked to order
   * @returns {Order} The order if marking it as complete succeedeed
   * @returns {false} False if it failed
   * @memberof IDBHandlerStrategy
   */
  markOrderAsComplete(reference: string): Promise<Order | false>

  /**
   * Mark an order as incomplete, in case the kitchen made a mistake, or the client wants a change in the order.
   *
   * @param {string} reference Client name or client id linked to order
   * @returns {Order} The order if marking it as complete succeedeed
   * @returns {false} False if it failed
   * @memberof IDBHandlerStrategy
   */
  markOrderAsIncomplete(reference: string): Promise<Order | false>

  /**
   * Get a client's cart.
   *
   * @param {string} clientReference Client name or client id linked to order
   * @returns {Cart} The cart in question if the client was found
   * @returns {-1} -1 if client was not found
   * @memberof IDBHandlerStrategy
   */
  getClientCurrentCart(clientReference: string): Promise<Cart | -1>

  /**
   * 'Checks out' client's cart, marking it as an order.
   * @see {@link Order} for what the client's cart becomes
   *
   * @param {string} clientReference Client name or client id
   * @param {(string | undefined)} observation Observation for the kitchen
   * @returns {Order} The order if it was a success
   * @returns {-1} -1 if there is no client under clientReference
   * @returns {-2} -2 if client in question has no products in the cart
   * @returns {-3} dunno
   * @memberof IDBHandlerStrategy
   */
  checkout(clientReference: string, observation: string | undefined): Promise<Order | -1 | -2 | -3>

  /**
   * Modifies the {@link Order}'s observation to the kitchen if the order isn't marked as complete.
   *
   * @param {string} reference Order id or client name linked to order
   * @param {(string | null)} observation Observation for the kitchen
   * @returns {Order} The order if it was a success
   * @returns {-1} -1 if there was an error during the procedure
   * @throws {Error} The order is marked as complete, and therefore unmodifiable.
   * @memberof IDBHandlerStrategy
   */
  modifyOrderObservation(reference: string, observation: string | null): Promise<Order | -1 | -2>
}