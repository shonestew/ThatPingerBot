import { Bot } from "grammy"
import * as mongoose from "mongoose";
import { config } from 'dotenv';
import { StartCommandHandler } from "./handlers/StartCommandHandler.ts";

config()

const bot = new Bot(process.env.TOKEN)

mongoose.connect(process.env.URL)

const handlers = [ new StartCommandHandler(bot) ]

handlers.forEach((command) => {
  command.handler()
})