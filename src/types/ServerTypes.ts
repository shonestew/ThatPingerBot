import { Document } from "mongoose";

export default interface ServerInfo extends Document {
  chatId: string | number;
  hostname: string;
  port: number
}