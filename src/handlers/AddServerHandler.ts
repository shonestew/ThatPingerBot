import { Bot } from "grammy";

export class AddServerHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot
  }

  public handler() {
    // this.bot.command("add_server", async (ctx))
  }
}