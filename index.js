let fs = require('fs');
let Discord = require('discord.js');
let Intents = Discord.Intents;

let config = require('./config.json');
let guildsBlacklist = require('./guildsBlacklist.json');

const clientIntents = new Intents().add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
);

let client = new Discord.Client({intents: clientIntents});

// Read and store commands in client.commands
client.commands = new Discord.Collection();
fs.readdirSync('./commands').forEach(category => {
    fs.readdirSync(`./commands/${category}`).forEach(c => {
        let command = require(`./commands/${category}/${c}/index.js`);
        client.commands.set(command.name, {
            name: command.name,
            description: command.desc,
            interactionHandler: command.interactionHandler,
            buttonHandler: command.buttonHandler
        });
        console.log(`Loaded ${command.name}`);
    })
})

// Event listeners
client.on('ready', c => {
    console.log(`\nLogged in and ready\n`);
	c.user.setActivity(`${c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, {type: 'WATCHING'});
})

client.on('error', console.error);

client.on('interactionCreate', interaction => {
    if(interaction.isCommand()) {
        if(client.commands.has(interaction.commandName)) {
            client.commands.get(interaction.commandName).interactionHandler(interaction);
        }
    } else if(interaction.isButton()) {
        let customId = interaction.customId;
        let [commandName, t, x, y, ...btnData] = customId.split('-');
        if(client.commands.has(commandName)) {  // Sanity check
            client.commands.get(commandName).buttonHandler(interaction, t, x, y, btnData);
        }
    }
})

client.on('guildCreate', guild => {
    console.log(`New guild\nName: ${guild.name}\nId: ${guild.id}`);

    if(guildsBlacklist.includes(guild.id)) {
        console.log(`Leaving blacklisted guild\nName: ${guild.name}\nId: ${guild.id}`);
        return guild.leave();
    }
})

// Reimport guildsBlacklist.json if it is updated
let fsWaitGuildBlacklist = false;
fs.watch('./guildsBlacklist.json', (event, filename) => {
    if (filename) {
        if (fsWaitGuildBlacklist) return;

        fsWaitGuildBlacklist = true;
        setTimeout(() => {
          fsWaitGuildBlacklist = false;
        }, 100);

        guildsBlacklist = require('./guildsBlacklist.json');
    }
})

if(config.token) client.login(config.token);
else if(process.env.TOKEN) client.login(process.env.TOKEN);
else throw('Invalid token.');