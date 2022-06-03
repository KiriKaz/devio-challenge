import mongoose from 'mongoose';
import type { Cart, Client as ClientType, IDBHandlerStrategy, Order as OrderType, Product as ProductType } from "../types";
import { ClientNotFound, OrderComplete, OrderNotFound, ProductNotFound, ProductNotInCart } from '../types/errors';
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
    const updatedClient = await client.save();
    return updatedClient;
  }
  
  async removeProductFromCart(clientRef: string, product: ProductType): Promise<ClientType> {
    const client = await Client.findOne({ $or: [{ name: clientRef }, { _id: clientRef }]});
    
    if(!client) throw new ClientNotFound();

    const idx = client.cart.products.findIndex(cartProduct => cartProduct._id === product._id);

    if(idx === -1) throw new ProductNotInCart();

    console.log('Removed product', client.cart.products.splice(idx, 1));
    console.log(client.cart.products);

    const updatedClient = await client.save();
    return updatedClient;
  }
  
  async markOrderAsComplete(reference: string): Promise<OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) throw new OrderNotFound();
    order.complete = true
    return await order.save();
  }
  
  async markOrderAsIncomplete(reference: string): Promise<OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) throw new OrderNotFound();
    order.complete = false
    return await order.save();
  }

  async getClientCurrentCart(clientReference: string): Promise<Cart> {
    const client = await Client.findOne({$or: [{ name: clientReference }, { _id: clientReference }]}).populate('cart.products');
    if(!client) throw new ClientNotFound();

    const cart = client.cart;
    console.log(cart);
    return cart;
  }

  async checkout(name: string, observation: string | undefined): Promise<OrderType> {
    throw new Error("Method not implemented.");
  }
  
  async modifyOrderObservation(reference: string, observation: string | null): Promise<OrderType> {
    const order = await Order.findOne({ client: reference  })
    if(!order) throw new OrderNotFound();
    if(order.complete) throw new OrderComplete();
    order.observation = observation ? observation : undefined;
    return await order.save();
  }
}