const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, botId } = require('./config.json');
const fs = require('fs');

if(!token) token = process.env.TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./commands/global');

commandFiles.forEach(cmdDir => {
    const builder = require(`./commands/global/${cmdDir}/builder.js`);
    commands.push(builder.data.toJSON());
})

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(botId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
    }
})();