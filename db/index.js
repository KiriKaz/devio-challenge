const { v4: uuidv4 } = require('uuid');

class DBHolder {
  constructor() {
    this.reloadProductsFromMemory();
    this.orders = [];
    this.cart = {};
  }

  reloadProductsFromMemory() {
    // eslint-disable-next-line import/extensions
    const products = require('../produtos.json');
    this.products = products;
    return this;
  }

  save() {
    this.products = {};
    // TODO implement save function
  }

  getProducts() {
    return this.products;
  }

  getDetailsAboutProduct(reference) {
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

  addProductToCart(clientName, product) {
    if (this.cart[clientName] === undefined) this.cart[clientName] = [product];
    else this.cart[clientName] += product;
    return this;
  }

  markOrderAsComplete(orderid) {
    this.orders.map(order => {
      if (order.id === orderid) {
        return { ...order, complete: true };
      }
      return { ...order };
    });

    return this;
  }

  markOrderAsIncomplete(orderid) {
    this.orders.map(order => {
      if (order.id === orderid) {
        return { ...order, complete: false };
      }
      return { ...order };
    });

    return this;
  }

  getCurrentCart(clientName) {
    return this.cart[clientName];
  }

  checkout(name, observation = undefined) {
    if (typeof name !== 'string') return -1;
    if (this.cart[name] === undefined) return -2;
    if (this.cart[name].products === []) return -3;

    const newOrder = {
      complete: false,
      orderId: uuidv4(),
      products: [...this.cart[name]],
      total: this.cart[name].reduce(
        (prev, current) => prev.price + current,
        0.0,
      ),
      client: name,
      observation,
    };

    this.orders.push(newOrder);
    console.log('New order created:\n', newOrder);

    delete this.cart[name];
    return this;
    // TODO implement add order w/ deleting earliest 5 if order count is >150
    // TODO this function can be expanded to save the history of fulfilled orders into a DB if need be
  }
}

const db = new DBHolder();

module.exports = db;
