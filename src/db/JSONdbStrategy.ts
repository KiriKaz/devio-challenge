import { v4 as uuidv4 } from 'uuid';
import { Cart, Client, IDBHandlerStrategy, Order, Product } from "../types";
import { CartEmpty, ClientNotFound, OrderComplete, OrderNotFound, ProductNotFound, ProductNotInCart } from '../types/errors';

export class JSONdbStrategy implements IDBHandlerStrategy {
  products: Product[];
  orders: Order[];
  clients: Client[];
  
  constructor() {
    this.products = [];
    this.reloadProductsFromMemory();
    this.orders = [];
    this.clients = [];
  }

  private orderCheck(order: Order, ref: string) { return order._id === ref || order.client.name === ref; }

  private clientCheck(client: Client, ref: string) { return client._id === ref || client.name === ref; }

  reloadProductsFromMemory() {
    const products = require('./json/produtos.json');
    this.products = products;
    return this;
  }

  async save(): Promise<void> {
    throw new Error("Method not implemented.");
    // TODO implement save function?
  }

  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getCurrentOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getDetailsAboutOrder(orderRef: string): Promise<Order> {
    const found = this.orders.find(
      order => order._id === orderRef || order.client.name === orderRef,
    )
    if(!found) throw new OrderNotFound();
    return found;
  }

  async getDetailsAboutProduct(reference: string): Promise<Product> {
    const found = this.products.find(product => {
      return product.name === reference || product._id === reference;
    });
    
    if(!found) throw new ProductNotFound();
    return found;
  }
  
  async addProductToCartWithRef(clientRef: string, productRef: string): Promise<boolean> {
    const product = this.products.find(
      product => product._id === productRef || product.name === productRef,
    );

    if (!product) throw new ProductNotFound();

    return this.addProductToCart(clientRef, product);
  }
    
  async removeProductFromCartWithRef(clientRef: string, productRef: string): Promise<boolean> {
    const product = this.products.find(p => p._id === productRef || p.name === productRef);
    if(!product) throw new ProductNotFound();

    return this.removeProductFromCart(clientRef, product);
  }

  async addProductToCart(clientRef: string, product: Product): Promise<boolean> {
    const foundClient = this.clients.find(client => this.clientCheck(client, clientRef));
    
    if (!foundClient) {
      this.clients.push({
        _id: uuidv4(),
        name: clientRef,
        cart: {
          products: [product],
          total: product.price
        }
      });
      return true;
    }

    this.clients = this.clients.map(client => {
      if (this.clientCheck(client, clientRef)) {
        const newClientObject: Client = { ...foundClient };
        newClientObject.cart.products.push(product);
        return newClientObject;
      }
      return client;
    });

    return true;
  }
  
  async removeProductFromCart(clientRef: string, product: Product): Promise<boolean> {
    const foundClient = this.clients.find(client => this.clientCheck(client, clientRef));

    if(!foundClient) throw new ClientNotFound();
    
    const idx = foundClient.cart.products.findIndex(p => p._id === product._id);

    if(idx === -1) throw new ProductNotInCart();

    console.log('Removed product', foundClient.cart.products.splice(idx, 1));
    console.log(foundClient.cart.products);

    return true;
  }

  async markOrderAsComplete(orderRef: string): Promise<Order> {
    const foundOrder = this.orders.find(order => this.orderCheck(order, orderRef));
    if(!foundOrder) throw new OrderNotFound();

    foundOrder.complete = true;

    this.orders = this.orders.map(order => {
      if (this.orderCheck(order, orderRef)) {
        return foundOrder;
      }
      return { ...order };
    });

    return foundOrder;
  }

  async markOrderAsIncomplete(orderRef: string): Promise<Order> {
    const foundOrder = this.orders.find(order => this.orderCheck(order, orderRef))
    if(!foundOrder) throw new OrderNotFound();

    foundOrder.complete = false;

    this.orders = this.orders.map(order => {
      if (this.orderCheck(order, orderRef)) {
        return foundOrder;
      }
      return { ...order };
    });

    return foundOrder;
  }

  async getClientCurrentCart(clientRef: string): Promise<Cart> {
    const found = this.clients.find(client => this.clientCheck(client, clientRef));
    if(!found) throw new ClientNotFound();
    return found.cart;
  }

  async checkout(clientRef: string, observation?: string): Promise<Order> {
    
    const foundClient = this.clients.find(client => this.clientCheck(client, clientRef));
    if (!foundClient) throw new ClientNotFound();
    const products = foundClient.cart.products;
    if (products.length === 0) throw new CartEmpty();

    const total = products.reduce((prevTotal: number, currentProduct: Product) => {
      return prevTotal + currentProduct.price;
    }, 0.0);

    const newOrder: Order = {
      complete: false,
      _id: uuidv4(),
      products,
      total,
      client: foundClient,
      observation
    };

    this.orders.push(newOrder);
    console.log('New order created:\n', newOrder);

    if (this.orders.length >= 150) {
      const removedOrders = this.orders.splice(0, 5);
      console.log('Five oldest orders removed:', removedOrders);
      // TODO this part can be expanded to save the history of fulfilled orders into a json file if need be with this.save();
    }

    this.clients = this.clients.map(client => {
      if(this.clientCheck(client, clientRef)) {
        const newClient: Client = {...client, cart: {
          products: [],
          total: 0.0
        }};
        return newClient;
      }
      return client;
    });
    return newOrder;
  }

  async modifyOrderObservation(ref: string, observation: string | null): Promise<Order> {
    const foundOrder = this.orders.find(order => this.orderCheck(order, ref));
    if(!foundOrder) throw new OrderNotFound();
    foundOrder.observation = observation ? observation : undefined;
    
    this.orders = this.orders.map(order => {
      if (this.orderCheck(order, ref)) {
        if (order.complete) throw new OrderComplete();
        return foundOrder;
      }
      return order;
    });
    
    return foundOrder;
  }
}