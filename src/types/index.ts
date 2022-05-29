
export type Product = {
  _id: string,
  name: string,
  price: number
}

export type Order = {
  _id: string,
  complete: boolean,
  client: Client,
  cart: Cart,
  observation?: string,
}

export type Cart = {
  products: Product[],
  total: number,
  observation?: string
}

export type Client = {
  _id: string,
  name: string,
  cart: Cart
}

export interface IDBHandlerStrategy {
  save(): Promise<void>
  getProducts(): Promise<Product[]>
  getCurrentOrders(): Promise<Order[]>
  getDetailsAboutOrder(reference: string): Promise<Order | false>
  getDetailsAboutProduct(reference: string): Promise<Product | false>
  addProductToCart(client: string, product: Product): Promise<boolean | -1>
  addProductToCartWithRef(client: string, productRef: string): Promise<boolean | -1>
  markOrderAsComplete(reference: string): Promise<Order | false>
  markOrderAsIncomplete(reference: string): Promise<Order | false>
  getClientCurrentCart(clientReference: string): Promise<Cart | -1>
  checkout(clientReference: string, observation: string | undefined): Promise<Order | -1 | -2 | -3>
  modifyOrderObservation(reference: string, observation: string | null): Promise<Order | -1>
}