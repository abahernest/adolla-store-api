import { mongo, Types } from 'mongoose';

export function ObjectIdFromHex(id: string): Types.ObjectId {
  return mongo.BSON.ObjectId.createFromHexString(id);
}
