import { model, Schema } from 'mongoose';
import { Order } from '../../../types';
import { toJSON as JSONTransform } from '../common';

const orderSchema = new Schema<Order>({
  complete: {
    type: Boolean,
    required: true,
    default: false
  },
  // id: {
  //   type: String,
  //   required: true
  // },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    default: []
  }],
  total: {
    type: Number,
    required: true,
    default: 0.0
  },
  observation: {
    type: String
  },
  client: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform: JSONTransform
  }
});

export default model<Order>('Order', orderSchema);