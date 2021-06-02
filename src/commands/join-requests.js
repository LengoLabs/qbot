const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Views the first page of join requests.',
    aliases: ['joinrequests'],
    usage: '',
    rolesRequired: ['Ranking Permissions', 'Join Requests Permissions'],
    category: 'Join Requests'
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();

        let joinRequests = await roblox.getJoinRequests(client.config.groupId);
        joinRequests = joinRequests.data;
        if(joinRequests.length <= 5) {
            let displayString = joinRequests.map(r => `${r.requester.username}`).join('\n');
            embed.setDescription(`Found \`${joinRequests.length}\` join requests.\n\n${displayString}`);
            embed.setColor(client.config.colors.info);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }

        embed.setDescription(`Found \`${joinRequests.length}\` join requests.\n\n${joinRequests.map(r => `${r.requester.username}`).join('\n')}`);
        embed.setColor(client.config.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());

        return message.channel.send(embed);
    }
}
