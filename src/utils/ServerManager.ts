import { createClient, ping } from "bedrock-protocol";
import ServerInfo from "../types/ServerTypes";

export class ServerManager {
  private chatId: number | string;

  constructor(chatId) {
    this.chatId = chatId;
  }

  private getSrvStatByPing(serverInfo: ServerInfo) {
    ping({ host: serverInfo.hostname, port: serverInfo.port }).then((res) => {
      return res;
    })
  }

  private getVersionByProtocol(protocol: any) {
    // Доделаю потом
  }

  public getSrvStatByBot(serverInfo: ServerInfo) {
    return new Promise((resolve, reject) => {
      const ping_res = this.getSrvStatByPing(serverInfo);

      const client = createClient({
        version: /* this.getVersionByProtocol(ping_res.protocol) */ "1.21.50",
        host: serverInfo.hostname,
        port: serverInfo.port,
        username: "ThatPingerBot",
        offline: true,
      });

      let players = [];

      // @ts-ignore
      client.on("join", () => {
        console.log("Бот зашел на сервер.");
      })

      // @ts-ignore
      client.on("packet", (packet) => {
        if (packet.data.name !== "player_list") return;

        const players_record = packet.data.params.records.records;
        players_record.forEach((data) => {
          if (data.username !== "UserBot" && !players.includes(data.username)) {
            players.push(data.username);
          }
        })

        setTimeout(() => {
          client.close();
          resolve({
            has_players: players.length > 0,
            players: players
          })
        }, 500);
      })
    })
  }
}