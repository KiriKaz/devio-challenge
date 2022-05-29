import { MONGODB_URI } from '../globals';
import { IDBHandlerStrategy } from "../types";
import { JSONdbStrategy } from "./JSONdbStrategy";
import { mongodbStrategy } from './mongodbStrategy';

let db: IDBHandlerStrategy;

if(MONGODB_URI) {
  db = new mongodbStrategy(MONGODB_URI);
} else {
  db = new JSONdbStrategy();
}


export default db;
