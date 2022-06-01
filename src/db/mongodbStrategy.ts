import mongoose from 'mongoose';
import type { Cart, IDBHandlerStrategy, Order as OrderType, Product as ProductType } from "../types";
import Order from './mongo/models/order';
import Product from './mongo/models/product';

export class mongodbStrategy implements IDBHandlerStrategy {
  constructor(uri: string) {
    mongoose.connect(uri, () => console.log('Mongoose connected.'));
  }

  async save(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getProducts(): Promise<ProductType[]> {
    const products = await Product.find({});
    return products;
  }

  async getCurrentOrders(): Promise<OrderType[]> {
    const orders = await Order.find({});
    return orders;
  }

  async getDetailsAboutOrder(reference: string): Promise<false | OrderType> {
    const order = await Order.findOne({ "$or": [{ "_id": reference }, { "client": reference }] })
    return order ? order : false;
  }
  
  async getDetailsAboutProduct(reference: string): Promise<false | ProductType> {
    const product = await Product.findOne({ "$or": [{ "_id": reference }, { "name": reference }] })
    console.log(reference, product);
    return product ? product : false;
  }

  async addProductToCart(clientName: string, product: ProductType): Promise<boolean | -1> {
    const client = ''; // TODO create Cart object type/model, start storing it in db
    throw new Error("Method not implemented.");
  }

  async addProductToCartWithRef(client: string, productRef: string): Promise<boolean | -1> {
    throw new Error("Method not implemented.");
  }
  
  async markOrderAsComplete(reference: string): Promise<false | OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) return false;
    order.complete = true
    return await order.save();
  }
  
  async markOrderAsIncomplete(reference: string): Promise<false | OrderType> {
    const order = await Order.findOne({ $or: [{ _id: reference }, { client: reference }] })
    if(order === null) return false;
    order.complete = false
    return await order.save();
  }

  async getClientCurrentCart(clientReference: string): Promise<Cart | -1> {
    const client = await Client.findOne({$or: [{ name: clientReference }, { _id: clientReference }]}).populate('cart.products');
    if(!client) return -1;

    const cart = client.cart;
    console.log(cart);
    return cart;
  }

  async checkout(name: string, observation: string | undefined): Promise<OrderType | -1 | -2 | -3> {
    throw new Error("Method not implemented.");
  }
  
  async modifyOrderObservation(reference: string, observation: string | null): Promise<OrderType | -1 | -2> {
    const order = await Order.findOne({ client: reference  })
    if(!order) return -1;
    if(order.complete) throw new Error('ALREADY COMPLETE');
    order.observation = observation ? observation : undefined;
    return await order.save();
  }
}