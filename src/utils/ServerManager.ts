import bedrock from "bedrock-protocol";
import axios from "axios";
import type { ServerInfo, PingResult } from "../types/ServerTypes.ts";

export class ServerManager {
  // Делает пинг сервера и возвращает информацию о нём
  private static async getSrvStatByPing(server_info: ServerInfo) {
    try {
      if (
        server_info.hostname === "" ||
        server_info.hostname === undefined ||
        Number.isNaN(server_info.port)
      ) return;

      const res_java = await (await axios.get(`http://api.mcsrvstat.us/3/${server_info.hostname}:${server_info.port}`)).data;
      const res_be = await (await axios.get(`http://api.mcsrvstat.us/bedrock/3/${server_info.hostname}:${server_info.port}`)).data;

      if (res_be.online === true || !res_be.protocol?.name) {
        return res_be;
      } else if (res_java.online === true || !res_be.debug?.error.bedrock) {
        return res_java;
      } else {
        return false;
      }
    } catch (e) {
      console.log('Ошибка при попытке посмотреть статуса сервера:', e);
    }
  }

  public static async getSrvStatByBot(server_info: ServerInfo): Promise<PingResult> {
    return new Promise(async (resolve) => {
      try {
        if (
          server_info.hostname === "" ||
          server_info.hostname === undefined ||
          Number.isNaN(server_info.port)
        ) {
          resolve({
            online: false,
            has_players: false,
            players: [],
            other_data: null
          })
          return;
        }

        const ping_res = await this.getSrvStatByPing(server_info);

        if (ping_res.online === false) {
          resolve({
            online: false,
            has_players: false,
            players: [],
            other_data: null
          })
          return;
        }

        const client = bedrock.createClient({
          host: server_info.hostname,
          port: server_info.port,
          username: "ThatPingerBot",
          offline: true,
          version: ping_res.protocol.name
        });

        let players: string[] = [];

        /*client.on("join", (packet) => {
          console.log("Бот зашел на сервер.")
        })*/

        client.on("spawn", () => {
          console.log("Бот заспавнился")
          // Когда поддержка TS будет в bedrock-protocol?
          // @ts-ignore
          client.queue('text', { type: "chat", needs_translation: false, source_name: client.username, message: "Это юзербот Телеграм-бота для проверки статуса. Не стоит бояться - этот бот только собирает список игроков и не более.\nВ случае возникновения вопросов, писать администратору бота: t.me/shonestew", xuid: '', platform_chat_id: '', filtered_message: '', })
        })

        client.on("packet", (packet) => {
          if (packet.data.name !== "player_list") return;

          const players_record: any = packet.data.params.records.records;
          players_record.forEach((data: any) => {
            if (data.username !== "UserBot" && !players.includes(data.username)) {
              players.push(data.username);
            }
          })

          setTimeout(() => {
            client.close();
            resolve({
              online: ping_res.online,
              has_players: players.length > 0,
              players: players,
              other_data: ping_res
            })
          }, 2500); // Не забудьте изменить значение тайм-аута. Ибо для спавна игрока нужно время
        })
      } catch (e) {
        console.log(e)
      }
    })
  }
}