import bedrock from "bedrock-protocol"
import axios from "axios"
import type { ServerInfo, PingResult } from "../types/ServerTypes.ts"
import { createBot } from "mineflayer"

export class ServerManager {
  public static async getSrvStatByPing(server_info: ServerInfo) {
    try {
      if (!server_info.hostname || server_info.hostname.trim() === "" || Number.isNaN(server_info.port)) {
        console.warn("Неверные данные сервера:", server_info)
        return null
      }

      const javaUrl = `https://api.mcsrvstat.us/3/${server_info.hostname}:${server_info.port}`
      const bedrockUrl = `https://api.mcsrvstat.us/bedrock/3/${server_info.hostname}:${server_info.port}`

      const [resJava, resBedrock] = await Promise.all([
        axios.get(javaUrl).then(res => res.data).catch(() => null),
        axios.get(bedrockUrl).then(res => res.data).catch(() => null)
      ])

      const javaOnline = resJava?.online === true && resJava?.protocol.version !== -1
      const bedrockOnline = resBedrock?.online === true

      if (bedrockOnline) return resBedrock
      if (javaOnline) return resJava

      return false
    } catch (e) {
      console.error("Ошибка при получении статуса сервера:", e)
      return null
    }
  }

  private static async attemptJavaBot(
    server_info: ServerInfo,
    ping_res: any,
    attemptsLeft: number
  ): Promise<PingResult> {
    return new Promise<PingResult>((resolve) => {
      const bot = createBot({
        username: "ThatPingerBot",
        host: server_info.hostname,
        port: server_info.port,
        auth: "offline",
        version: ping_res.protocol.name,
        skipValidation: true
      })

      let players: string[] = []
      let timeout: NodeJS.Timeout
      let finished = false

      bot.once('login', () => console.log(`Вошли как ${bot.username}`))
      bot.on('kicked', () => {
        if (!finished) {
          finished = true
          clearTimeout(timeout)
          bot.removeAllListeners()
          bot.end()
          if (attemptsLeft > 1) {
            console.log(`Попытка подключения не удалась, осталось попыток: ${attemptsLeft - 1}`)
            resolve(this.attemptJavaBot(server_info, ping_res, attemptsLeft - 1))
          } else {
            resolve({ error: 'kicked', data: { online: true, has_players: false, players: [], other_data: ping_res } })
          }
        }
      })

      bot._client.on('packet', (data, meta) => {
        if (meta.name === "player_info") {
          const name: string | undefined = data.data[0]?.player?.name
          if (name && name !== "UserBot" && !players.includes(name)) players.push(name)
        }
      })

      timeout = setTimeout(() => {
        if (!finished) {
          finished = true
          clearTimeout(timeout)
          bot.removeAllListeners()
          bot.end()
          resolve({
            error: false,
            data: { online: true, has_players: players.length > 0, players, other_data: ping_res }
          })
        }
      }, 4000)

      bot.on('error', () => {
        if (!finished) {
          finished = true
          clearTimeout(timeout)
          bot.removeAllListeners()
          bot.end()
          if (attemptsLeft > 1) {
            console.log(`Ошибка клиента, осталось попыток: ${attemptsLeft - 1}`)
            resolve(this.attemptJavaBot(server_info, ping_res, attemptsLeft - 1))
          } else {
            resolve({ error: 'client_error', data: { online: true, has_players: false, players: [], other_data: ping_res } })
          }
        }
      })
    })
  }

  public static async getSrvStatByBot(server_info: ServerInfo): Promise<PingResult> {
    try {
      if (!server_info.hostname || server_info.hostname.trim() === "" || Number.isNaN(server_info.port)) {
        console.warn("Неверные данные сервера:", server_info)
        return {
          error: "incorrect_server_info",
          data: { online: false, has_players: false, players: [], other_data: null }
        }
      }

      const ping_res = await this.getSrvStatByPing(server_info)

      if (!ping_res?.online) {
        return { error: false, data: { online: false, has_players: false, players: [], other_data: ping_res } }
      }

      if (ping_res.debug.bedrock) {
        return await new Promise<PingResult>((resolve) => {
          const client = bedrock.createClient({
            version: ping_res.protocol.name,
            host: server_info.hostname,
            port: server_info.port,
            username: "ThatPingerBot",
            offline: true,
            skipPing: true
          })

          let players: string[] = []
          let timeout: NodeJS.Timeout

          client.on("spawn", () => {
            // Всё еще жду когда добавят типизацию
            // @ts-ignore
            client.queue("text", { type: "chat", needs_translation: false, source_name: client.username,
              message: "Это юзербот Телеграм-бота для проверки статуса. Не стоит бояться - этот бот только собирает список игроков и не более." +
              "\nВ случае возникновения вопросов, писать администратору бота: t.me/shonestew",
              xuid: '',
              platform_chat_id: '',
              filtered_message: ''
            })
          })

          client.on("packet", (packet) => {
            if (packet.data.name === "player_list") {
              const records: any = packet.data.params.records.records
              records.forEach((data: any) => {
                if (data.username !== "UserBot" && !players.includes(data.username)) players.push(data.username)
              })
              timeout = setTimeout(() => {
                client.close()
                resolve({ error: false, data: { online: true, has_players: players.length > 0, players, other_data: ping_res } })
              }, 4000)
            } else if (packet.data.name === "disconnect") {
              timeout = setTimeout(() => {
                client.close()
                resolve({ error: packet.data.params.reason, data: { online: true, has_players: players.length > 0, players, other_data: ping_res } })
              }, 2500)
            }
          })

          timeout = setTimeout(() => {
            client.close()
            resolve({ error: "no_response_received", data: { online: true, has_players: false, players: [], other_data: ping_res } })
          }, 50000)

          client.on("error", (err) => {
            clearTimeout(timeout)
            client.close()
            resolve({ error: "client_error", data: { online: true, has_players: false, players: [], other_data: ping_res } })
          })
        })
      }
      return await this.attemptJavaBot(server_info, ping_res, 50)
    } catch (e) {
      console.error("Ошибка в getSrvStatByBot:", e)
      return { error: "class_method_error", data: { online: false, has_players: false, players: [], other_data: null } }
    }
  }
}