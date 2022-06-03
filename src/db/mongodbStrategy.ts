import mongoose from 'mongoose';
import type { Cart, Client as ClientType, IDBHandlerStrategy, Order as OrderType, Product as ProductType } from "../types";
import { CartEmpty, ClientNotFound, OrderComplete, OrderNotFound, ProductNotFound, ProductNotInCart } from '../types/errors';
import Client from './mongo/models/client';
import Order from './mongo/models/order';
import Product from './mongo/models/product';

export class mongodbStrategy implements IDBHandlerStrategy {
  constructor(uri: string) {
    mongoose.connect(uri, () => console.log('Mongoose connected.'));
  }

  async getProducts(): Promise<ProductType[]> {
    const products = await Product.find({});
    return products;
  }

  async getCurrentOrders(): Promise<OrderType[]> {
    const orders = await Order.find({});
    return orders;
  }

  async getDetailsAboutOrder(reference: string): Promise<OrderType> {
    const order = await Order.findOne({ "$or": [{ "_id": reference }, { "client": reference }] })
    if(!order) throw new OrderNotFound();
    return order;
  }
  
  async getDetailsAboutProduct(reference: string): Promise<ProductType> {
    const product = await Product.findOne({ "$or": [{ "_id": reference }, { "name": reference }] })
    if(!product) throw new ProductNotFound();
    return product;
  }

  async addProductToCartWithRef(clientRef: string, productRef: string): Promise<ClientType> {
    const product = await Product.findOne({ $or: [{ name: productRef }, { _id: productRef }]});

    if(!product) throw new ProductNotFound();
    
    return await this.addProductToCart(clientRef, product);
  }

  async removeProductFromCartWithRef(clientRef: string, productRef: string): Promise<ClientType> {
    const product = await Product.findOne({ $or: [{ name: productRef }, { _id: productRef }]});
    
    if(!product) throw new ProductNotFound();

    return await this.removeProductFromCart(clientRef, product);
  }
  
  async addProductToCart(clientRef: string, product: ProductType): Promise<ClientType> {
    
    let client = await Client.findOne({ $or: [{ name: clientRef }, { _id: clientRef }] }).populate('cart.products');
    
    if(!client) {
      const cart = {
        products: [],
        total: 0.0
      }
      console.log(cart);
      client = await Client.create({
        name: clientRef,
        cart: cart
      });
      console.log(client);
    };
    
    client.cart.products.push(product);
    client.cart.total = Number(client.cart.total) + product.price;  // As we're using Decimal128 here, the type is related differently in TS than when running it. Using the + operator performs a string add.
    console.log("Added product", product._id, "to the cart of client", client.name, ".");
    const updatedClient = await client.save();
    return updatedClient;
  }
  
  async removeProductFromCart(clientRef: string, product: ProductType): Promise<ClientType> {
    const client = await Client.findOne({ $or: [{ name: clientRef }, { _id: clientRef }]});
    
    if(!client) throw new ClientNotFound();

    const idx = client.cart.products.findIndex(cartProduct => cartProduct._id === product._id);

    if(idx === -1) throw new ProductNotInCart();

    const removedProd = client.cart.products.splice(idx, 1)[0];

    console.log('Removed product', removedProd._id, "from the cart of client", client.name, ".");
    client.cart.total -= removedProd.price;

    const updatedClient = await client.save();
    return updatedClient;
  }
  
  async markOrderAsComplete(reference: string): Promise<OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) throw new OrderNotFound();
    order.complete = true
    console.log("Marked order", order._id, "as complete.");
    return await order.save();
  }
  
  async markOrderAsIncomplete(reference: string): Promise<OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) throw new OrderNotFound();
    order.complete = false
    console.log("Marked order", order._id, "as incomplete.");
    return await order.save();
  }

  async getClientCurrentCart(clientReference: string): Promise<Cart> {
    const client = await Client.findOne({$or: [{ name: clientReference }, { _id: clientReference }]}).populate('cart.products');
    if(!client) throw new ClientNotFound();

    const cart = client.cart;
    console.log(cart);
    return cart;
  }

  async checkout(clientRef: string, paymentMethod: string, observation?: string): Promise<OrderType> {
    const client = await Client.findOne({ $or: [{ name: clientRef }, { _id: clientRef }] });

    if(!client) throw new ClientNotFound();

    if(client.cart.products.length === 0) throw new CartEmpty();

    const order = await (new Order({
      client,
      products: client.cart.products,
      total: client.cart.total,
      complete: false,
      paymentMethod,
      observation
    })).save();

    client.cart = {
      products: [],
      total: 0.0
    };
    await client.save();
    
    return order;
  }
  
  async modifyOrderObservation(reference: string, observation: string | null): Promise<OrderType> {
    const order = await Order.findOne({ client: reference  })
    if(!order) throw new OrderNotFound();
    if(order.complete) throw new OrderComplete();
    order.observation = observation ? observation : undefined;
    console.log("Modified", order._id, "observation to '", observation, "'.");
    return await order.save();
  }
}