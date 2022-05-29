import { v4 as uuidv4 } from 'uuid';
import { Cart, Client, IDBHandlerStrategy, Order, Product } from "../types";

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

  async getDetailsAboutOrder(orderRef: string): Promise<false | Order> {
    const filtered = this.orders.filter(
      order => order._id === orderRef || order.client.name === orderRef,
    )
    return filtered.length === 1 ? filtered[0] : false;
  }

  async getDetailsAboutProduct(reference: string): Promise<false | Product> {
    const ref = reference.toLowerCase();
    const found = this.products.filter(product => {
      return product.name.toLowerCase() === ref || product._id.toLowerCase() === ref;
    });

    // If there is no product by the given reference,
    // return -1 to indicate there was an error, which
    // can be handled by the front end whichever way
    // they want.
    return found === [] ? false : found[0];
  }

  async addProductToCart(clientReference: string, product: Product): Promise<boolean> {
    const foundClient = this.clients.filter(client => this.clientCheck(client, clientReference))[0]
    if (foundClient === undefined) this.clients.push({
      _id: uuidv4(),
      name: clientReference,
      cart: {
        products: [product],
        total: product.price
      }
    });
    else {
      this.clients = this.clients.map(client => {
        if (this.clientCheck(client, clientReference)) {
          const clientCart: Cart = foundClient.cart ? foundClient.cart : {
            products: [],
            total: 0
          };
          const clientProducts: Product[] = clientCart.products;

          const newClientObject: Client = {
            ...foundClient,
            cart: {
              ...clientCart,
              products: [
                ...clientProducts,
                product
              ]
            }
          }
          return newClientObject;
        }
        
        return client;
      });
    }
    return true;
  }

  async addProductToCartWithRef(clientRef: string, productRef: string): Promise<boolean | -1> {
    const product = this.products.filter(
      product => product._id === productRef || product.name === productRef,
    )[0];

    if (product === undefined) return -1;

    const client = this.clients.filter(client => this.clientCheck(client, clientRef));
    if (client.length === 0) {
      this.clients.push({
        _id: uuidv4(),
        name: clientRef,
        cart: {
          products: [product],
          total: product.price
        }
      });
    } else {
      this.clients = this.clients.map(client => {
        if (this.clientCheck(client, clientRef)) {
          // favor immutability
          const newClient = {...client};
          newClient.cart.products.push(product);
          return newClient;
        }
        return client;
      })
    }

    return true;
  }

  async markOrderAsComplete(orderRef: string): Promise<false | Order> {
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

  async markOrderAsIncomplete(orderRef: string): Promise<false | Order> {
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

  async getClientCurrentCart(clientRef: string): Promise<Cart> {
    return this.clients.filter(client => this.clientCheck(client, clientRef))[0].cart;
  }

  async checkout(clientRef: string, observation?: string): Promise<Order | -1 | -2> {
    
    const foundClient = this.clients.filter(client => this.clientCheck(client, clientRef))[0];
    if (foundClient === undefined) return -1;
    const products = foundClient.cart.products;
    if (products === []) return -2;

    const total = products.reduce((prevTotal: number, currentProduct: Product) => {
      return prevTotal + currentProduct.price;
    }, 0.0);

    const newOrder: Order = {
      complete: false,
      _id: uuidv4(),
      cart: {
        products,
        total
      },
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

  async modifyOrderObservation(ref: string, observation: string | null): Promise<Order | -1> {
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