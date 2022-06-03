import { model, Schema } from 'mongoose';
import { Client } from '../../../types';
import { toJSON as JSONTransform } from '../common';

const clientSchema = new Schema<Client>({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cart: {
    products: [{
      type: String,
      ref: 'Product',
      required: true
    }],
    total: {
      type: Schema.Types.Decimal128,  // TODO Typing is incorrect: adding only adds "5" as string, making "5" + "5" instead of 5+5 = 10.
      required: true,
      default: 0.0
    },
    observation: {
      type: String
    }
  }
}, {
  toJSON: {
    transform: JSONTransform
  },
  _id: false
});

export default model<Client>('Client', clientSchema, 'clients');