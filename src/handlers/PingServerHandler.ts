import { Bot } from "grammy";
import { ServerManager } from "../utils/ServerManager.ts";

export default class PingServerHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public handler() {
    this.bot.on("message").command("ping_server", async (ctx) => {
      const match = ctx.message.text.split(" ")
      const hostname = match[1]
      const port = Number(match[2]) || 19132

      if (!hostname || !port || Number.isNaN(port)) {
        ctx.reply("Нету нужных параметров или один из параметров неверно введён!")
        return;
      }

      let ready_mess = await ctx.reply("Начинаем пинг сервера...", {
        reply_to_message_id: ctx.message.message_id,
      })

      const ping_res = await ServerManager.getSrvStatByBot({ hostname, port })

      if (ping_res?.data.online && !ping_res?.error) {
        const players_list = ping_res?.data.players.length > 0
          ? ping_res?.data.players.join(", ")
          : "Нету"

        ctx.reply("Статус сервера - включён." +
          `\nКоличество игроков - ${ping_res?.data.players.length}/${ping_res?.data.other_data?.players.max},` +
          `\nСписок игроков: ${players_list}` +
          `\nДебаг-информация: <blockquote expandable>${JSON.stringify(ping_res, null, 2)}</blockquote>`, {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML"
        })
        await ctx.api.deleteMessage(ctx.message.chat.id, ready_mess.message_id)
        return;
      } else if (ping_res?.error === "not_authenticated") {
        ctx.reply("Статус сервера - включён." +
          `\nКоличество игроков - ${ping_res?.data.other_data?.players.online}/${ping_res?.data.other_data?.players.max}` +
          "\nСписок игроков - не получен" +
          `\nДебаг-информация: <blockquote expandable>${JSON.stringify(ping_res, null, 2)}</blockquote>`, {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML"
        })
        await ctx.api.deleteMessage(ctx.message.chat.id, ready_mess.message_id)
        return;
      } else {
        ctx.reply(`Статус сервера - отключён.\nДебаг-информация: <blockquote expandable>${JSON.stringify(ping_res, null, 2)}</blockquote>`, {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML"
        })
        await ctx.api.deleteMessage(ctx.message.chat.id, ready_mess.message_id)
        return;
      }
    })
  }
}