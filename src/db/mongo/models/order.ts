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
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: []
    }
  ],
  client: {
    type: String,
    required: true
  },
  observation: {
    type: String,
    required: false
  }
}, {
  toJSON: {
    transform: JSONTransform
  }
});

export default model<Order>('Order', orderSchema);