import mongoose, { model, Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import { Order } from '../../../types';
import { toJSON as JSONTransform } from '../common';

// The @types/mongoose-sequence package is incorrect, and the dev doesn't care, so we ignore the error here. Follow docs here:
// https://github.com/ramiel/mongoose-sequence
// https://stackoverflow.com/a/71859686
// https://github.com/ramiel/mongoose-sequence/issues/111
// @ts-expect-error
const AutoInc = AutoIncrementFactory(mongoose);

const orderSchema = new Schema<Order>({
  complete: {
    type: Boolean,
    required: true,
    default: false
  },
  _id: {
    type: Number,
    required: true
  },
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
  },
  paymentMethod: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform: JSONTransform
  },
  _id: false
});

// The @types/mongoose-sequence package is incorrect, and the dev doesn't care, so we ignore the error here. Follow docs here:
// https://github.com/ramiel/mongoose-sequence
// https://stackoverflow.com/a/71859686
// https://github.com/ramiel/mongoose-sequence/issues/111
// @ts-expect-error
orderSchema.plugin(AutoInc);

export default model<Order>('Order', orderSchema);