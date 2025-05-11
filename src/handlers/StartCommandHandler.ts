import { Bot } from "grammy";

export class StartCommandHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot
  }

  public handler() {
    this.bot.command("start", async (ctx) => {
      await ctx.reply("Привет! Это бот для пинга сервера")
    })
  }
}