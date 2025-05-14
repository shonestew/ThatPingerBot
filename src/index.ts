import * as dotenv from 'dotenv';
dotenv.config()

import { Bot } from "grammy"
import * as mongoose from "mongoose";
import StartCommandHandler from "./handlers/StartCommandHandler.ts";
import PingServerHandler from "./handlers/PingServerHandler.ts";

const token = process.env.TOKEN
if (!token) throw new Error('BOT TOKEN is not defined in environment variables')
const bot = new Bot(token)

const dbUrl = process.env.URL
if (!dbUrl) throw new Error('Database URL is not defined in environment variables')
mongoose.connect(dbUrl)

const handlers = [ new StartCommandHandler(bot), new PingServerHandler(bot) ]

handlers.forEach((command) => {
  command.handler()
})

bot.start()