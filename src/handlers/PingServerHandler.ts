import { Bot } from "grammy";
import { ServerManager } from "../utils/ServerManager.ts";

export default class PingServerHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public handler() {
    this.bot.on("message").command("ping_server", async (ctx) => {
      const match = ctx.message!.text.split(" ")
      const hostname = match[1]
      const port = Number(match[2])

      if (hostname.endsWith("block-battle.lol")) return

      if (!hostname || !port || Number.isNaN(port)) {
        ctx.reply("Нету нужных параметров или один из параметров неверно введён!")
        return;
      }

      let ready_mess = await ctx.reply("Начинаем пинг сервера...", {
        reply_to_message_id: ctx.message.message_id,
      })

      const ping_res = await ServerManager.getSrvStatByBot({ hostname, port })
      const players_list = ping_res.players.length > 0
        ? ping_res.players.join(", ")
        : "Нету"

      if (ping_res.online) {
        await ctx.reply("Статус сервера - включён." +
          `\nКоличество игроков - ${ping_res.players.length},` +
          `\nСписок игроков: ${players_list}`, {
          reply_to_message_id: ctx.message.message_id,
        })
        await ctx.api.deleteMessage(ctx.message.chat.id, ready_mess.message_id)
      } else {
        await ctx.reply("Статус сервера - отключён.", {
          reply_to_message_id: ctx.message.message_id,
        })
      }
    })
  }
}