import { v4 as uuidv4 } from 'uuid';

type Product = {
  name: string,
  id: string,
  price: number
}

type Order = {
  complete: boolean,
  id: string,
  products: Product[],
  total: number,
  client: string,
  observation?: string,
}

class DBHolder {
  products: Product[];
  orders: Order[];
  cart: any;
  
  constructor() {
    this.products = [];
    this.reloadProductsFromMemory();
    this.orders = [];
    this.cart = {};
  }

  reloadProductsFromMemory() {
    // eslint-disable-next-line import/extensions
    const products = require('../../produtos.json');
    this.products = products;
    return this;
  }

  save() {
    return this.products; // so the editor doesnt yell at me
    // TODO implement save function
  }

  getProducts() {
    return this.products;
  }

  getCurrentOrders() {
    return this.orders;
  }

  getDetailsAboutOrder(orderRef: string) {
    return this.orders.filter(
      order => order.id === orderRef || order.client === orderRef,
    );
  }

  getDetailsAboutProduct(reference: string) {
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
    return found === [] ? -1 : found;
  }

  addProductToCart(clientName: string, productRef: string) {
    const product = this.products.filter(
      product => product.id === productRef || product.name === productRef,
    );

    if (product.length === 0) return -1;
    if (this.cart[clientName] === undefined)
      this.cart[clientName] = [product[0]];
    else this.cart[clientName] += product[0];
    return this;
  }

  markOrderAsComplete(orderRef: string) {
    this.orders = this.orders.map(order => {
      if (order.id === orderRef || order.client === orderRef) {
        return { ...order, complete: true };
      }
      return { ...order };
    });

    return this;
  }

  markOrderAsIncomplete(orderRef: string) {
    this.orders.map(order => {
      if (order.id === orderRef || order.client === orderRef) {
        return { ...order, complete: false };
      }
      return { ...order };
    });

    return this;
  }

  getCurrentCart(clientName: string) {
    return this.cart[clientName];
  }

  checkout(name: string, observation: string | undefined = undefined) {
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

  modifyOrderObservation(reference: string, observation: string | undefined) {
    try {
      const modifiedOrders = this.orders.map(order => {
        if (order.client === reference || order.id === reference) {
          if (!order.complete) return { ...order, observation };
          throw new Error('ALREADY COMPLETE');
        }
        return order;
      });
      this.orders = modifiedOrders;
      return this;
    } catch (e) {
      return -1;
    }
  }
}

const db = new DBHolder();

export default db;
