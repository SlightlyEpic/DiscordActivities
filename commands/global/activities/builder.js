const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');
const act = require('../../../act.json');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addStringOption(option => {
        option = option
        .setName('activity')
        .setDescription('The activity to start')
        .setRequired(true)

        Object.keys(act).forEach(appId => {
            option = option.addChoice(act[appId], appId);
        })

        return option;
        })
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel to start the activity in')
        .setRequired(true)
        .addChannelType(2)      // 2 is "GuildVoice" https://discord.com/developers/docs/resources/channel#channel-object-channel-types
        );

module.exports = { data };