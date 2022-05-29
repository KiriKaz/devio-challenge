export type Product = {
  name: string,
  id: string,
  price: number
}

export type Order = {
  complete: boolean,
  id: string,
  products: Product[],
  total: number,
  client: string,
  observation?: string,
}

export interface IDBHandlerStrategy {
  save(): void
  getProducts(): Product[]
  getCurrentOrders(): Order[]
  getDetailsAboutOrder(reference: string): Order | false
  getDetailsAboutProduct(reference: string): Product | false
  addProductToCart(client: string, product: Product): boolean | -1
  addProductToCartWithRef(client: string, productRef: string): boolean | -1
  markOrderAsComplete(reference: string): Order | false
  markOrderAsIncomplete(reference: string): Order | false
  getCurrentCart(client: string): any | -1  // Return cart object
  checkout(name: string, observation: string | undefined): Order | -1 | -2 | -3
  modifyOrderObservation(reference: string, observation: string | null): Order | -1
}