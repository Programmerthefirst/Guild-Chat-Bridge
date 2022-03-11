const CommunicationBridge = require('../contracts/CommunicationBridge')
const CommandHandler = require('./CommandHandler')
const StateHandler = require('./handlers/StateHandler')
const ErrorHandler = require('./handlers/ErrorHandler')
const ChatHandler = require('./handlers/ChatHandler')
const mineflayer = require('mineflayer')

class MinecraftManager extends CommunicationBridge {
	constructor(app) {
		super()

		this.app = app

		this.stateHandler = new StateHandler(this)
		this.errorHandler = new ErrorHandler(this)
		this.chatHandler = new ChatHandler(this, new CommandHandler(this))
	}

	connect() {
		this.bot = this.createBotConnection()

		this.errorHandler.registerEvents(this.bot)
		this.stateHandler.registerEvents(this.bot)
		this.chatHandler.registerEvents(this.bot)
	}

	createBotConnection() {
		return mineflayer.createBot({
			host: this.app.config.server.host,
			port: this.app.config.server.port,
			username: this.app.config.minecraft.username,
			password: this.app.config.minecraft.password,
			version: '1.8.9',
			auth: this.app.config.minecraft.accountType,
			hideErrors: true,
		})
	}

	fetchAPIKey() {
		if (this.app.config.api.autoReplace) {
			this.app.log.broadcast(`Replacing API Key`, 'Minecraft')
			this.bot.chat(`/api new`)
		}
	}

	onBroadcast({ username, message, replyingTo, chatType }) {
		this.app.log.broadcast(`<${chatType}> ${username}: ${message}`, 'Minecraft')

		if (this.bot.player !== undefined) {
			this.bot.chat(`/${chatType.slice(0, 1)}c ${replyingTo ? `${username} replying to ${replyingTo}:` : `${username}:`} ${message}`)
		}
	}
}

module.exports = MinecraftManager
