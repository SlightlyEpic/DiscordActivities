let { MessageEmbed } = require('discord.js');
let act = require('../../../act.json');
let { InviteTargetType, RouteBases, Routes } = require('discord-api-types/v9');
let fetch = require('node-fetch');

let { token } = require('../../../config.json');
if (!token) token = process.env.TOKEN;

module.exports = {
    name: "activities",
    desc: "Starts an activity of your choice in a voice channel",
    interactionHandler: async interaction => {
        await interaction.deferReply();
        let activityId = interaction.options.getString("activity");
        let vc = interaction.options.getChannel("channel");

        if(!activityId) {
            let emb = new MessageEmbed()
            .setColor('#EE1111')
            .setTitle('Error')
            .setDescription("This activity was not found! Make sure you only choose from the choices provided!")
            return interaction.editReply({ embeds: [emb] });
        } else {
            const r = await fetch(`${RouteBases.api}${Routes.channelInvites(vc.id)}`, {
                method: 'POST',
                headers: { authorization: `Bot ${token}`, 'content-type': 'application/json' },
                body: JSON.stringify({
                    max_age: 0,
                    target_type: InviteTargetType.EmbeddedApplication,
                    target_application_id: activityId
                })
            })

            const invite = await r.json();

            if(r.status !== 200) {
                let emb = new MessageEmbed()
                .setColor('#EE1111')
                .setTitle('Error')
                .setDescription(`Please grant me the "Create Invite" permission in the voice channel!`)
                return interaction.editReply({ embeds: [emb] });
            } else {
                let emb = new MessageEmbed()
                .setColor('#78EDE7')
                .setTitle('Activity set!')
                .setDescription(`<:wumpusstar:912658958509035630> Click [here](<https://discord.gg/${invite.code}>) to open ${invite.target_application.name} in ${invite.channel.name}`)
                return interaction.editReply({ embeds: [emb] });
            }
            
        }
    },
    buttonHandler: async (interaction, t, x, y, btnData) => {
        return;
    }
}