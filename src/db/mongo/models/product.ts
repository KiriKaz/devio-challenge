import { model, Schema } from 'mongoose';
import { Product } from '../../../types';

const productSchema = new Schema<Product>({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

export default model<Product>('Product', productSchema);