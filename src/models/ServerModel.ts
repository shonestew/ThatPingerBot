import * as mongoose from "mongoose";
import { ServerInfo } from "../types/ServerTypes.ts";

const serverSchema = new mongoose.Schema<ServerInfo>({
  chatId: { type: mongoose.Schema.Types.Mixed, required: true },
  hostname: { type: String, required: true },
  port: { type: mongoose.Schema.Types.Mixed, required: true }
})

const serverModel = mongoose.model("servers_info", serverSchema, "servers_info");

export class ServerModel {
  private model: mongoose.Model<ServerInfo>

  constructor() {
    this.model = serverModel
  }

  public async addServer(hostname: string, port: string | number) {
    try {
      const server = new this.model({ hostname, port });
      return { result: true, data: { hostname, port } }
    } catch (e) {
      console.log("Error adding server to database: ", e)
      return { result: false, data: { hostname, port }}
    }
  }
}