import { Bot } from "grammy";

// Допишу как-нибудь потом
export class AddServerHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot
  }

  public handler() {
    this.bot.on("message").command("add_server", async (ctx) => {
      // ...
    })
  }
}