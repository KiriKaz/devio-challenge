import { v4 as uuidv4 } from 'uuid';
import { IDBHandlerStrategy, Order, Product } from "../types";

export class JSONdbStrategy implements IDBHandlerStrategy {
  products: Product[];
  orders: Order[];
  cart: any;
  
  constructor() {
    this.products = [];
    this.reloadProductsFromMemory();
    this.orders = [];
    this.cart = {};
  }

  private orderCheck(order: Order, ref: string) {
    return order.id === ref || order.client === ref;
  }

  reloadProductsFromMemory() {
    const products = require('../json/produtos.json');
    this.products = products;
    return this;
  }

  save(): void {
    return; // so the editor doesnt yell at me
    // TODO implement save function?
  }

  getProducts(): Product[] {
    return this.products;
  }

  getCurrentOrders(): Order[] {
    return this.orders;
  }

  getDetailsAboutOrder(orderRef: string): Order | false {
    const filtered = this.orders.filter(
      order => order.id === orderRef || order.client === orderRef,
    )
    return filtered.length === 1 ? filtered[0] : false;
  }

  getDetailsAboutProduct(reference: string): Product | false {
    const ref = reference.toLowerCase();
    const found = this.products.filter(product => {
      return (
        product.name.toLowerCase() === ref || product.id.toLowerCase() === ref
      );
    });

    // If there is no product by the given reference,
    // return -1 to indicate there was an error, which
    // can be handled by the front end whichever way
    // they want.
    return found === [] ? false : found[0];
  }

  addProductToCart(client: string, product: Product): boolean | -1 {
    if (this.cart[client] === undefined)
      this.cart[client] = [product];
    else this.cart[client] += product;
    return true;
  }

  addProductToCartWithRef(client: string, productRef: string): boolean | -1 {
    const product = this.products.filter(
      product => product.id === productRef || product.name === productRef,
    );

    if (product.length === 0) return -1;
    if (this.cart[client] === undefined)
      this.cart[client] = [product[0]];
    else this.cart[client] += product[0];
    return true;
  }

  markOrderAsComplete(orderRef: string): Order | false {
    const foundOrder = this.orders.filter(order => this.orderCheck(order, orderRef))[0]
    if(foundOrder === undefined) return false;

    foundOrder.complete = true;

    this.orders = this.orders.map(order => {
      if (this.orderCheck(order, orderRef)) {
        return foundOrder;
      }
      return { ...order };
    });

    return foundOrder;
  }

  markOrderAsIncomplete(orderRef: string): Order | false {
    const foundOrder = this.orders.filter(order => this.orderCheck(order, orderRef))[0]
    if(foundOrder === undefined) return false;

    foundOrder.complete = false;

    this.orders = this.orders.map(order => {
      if (this.orderCheck(order, orderRef)) {
        return foundOrder;
      }
      return { ...order };
    });

    return foundOrder;
  }

  getCurrentCart(clientName: string) {
    return this.cart[clientName];
  }

  checkout(name: string, observation: string | undefined = undefined): Order | -1 | -2 | -3 {
    if (typeof name !== 'string') return -1;
    if (this.cart[name] === undefined) return -2;
    if (this.cart[name].products === []) return -3;

    const total = this.cart[name].reduce((prevTotal: number, currentProduct: Product) => {
      return prevTotal + currentProduct.price;
    }, 0.0);

    const newOrder: Order = {
      complete: false,
      id: uuidv4(),
      products: [...this.cart[name]],
      total,
      client: name,
      observation,
    };

    this.orders.push(newOrder);
    // console.log('New order created:\n', newOrder);

    if (this.orders.length >= 150) {
      const removedOrders = this.orders.splice(0, 5);
      console.log('Five oldest orders removed:', removedOrders);
      // TODO this part can be expanded to save the history of fulfilled orders into a DB if need be with this.save();
    }

    delete this.cart[name];
    return newOrder;
  }

  modifyOrderObservation(ref: string, observation: string | null): Order | -1 {
    try {
      const foundOrder = this.orders.filter(order => this.orderCheck(order, ref))[0];
      foundOrder.observation = observation ? observation : undefined;
      
      this.orders = this.orders.map(order => {
        if (this.orderCheck(order, ref)) {
          if (!order.complete) return foundOrder;
          throw new Error('ALREADY COMPLETE');
        }
        return order;
      });
      
      return foundOrder;
    } catch (e) {
      console.log('Error during modifyOrderObs:', e);
      return -1;
    }
  }
}