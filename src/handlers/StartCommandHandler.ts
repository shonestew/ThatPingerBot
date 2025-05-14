import { Bot, Context } from "grammy";

export default class StartCommandHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot
  }

  public handler() {
    this.bot.command("start", async (ctx: Context) => {
      await ctx.reply("Привет! Это бот для пинга сервера. Команды:" +
        "\n/ping_server [ip] [port] - пингует сервер и извлекает оттуда список игроков")
    })
  }
}