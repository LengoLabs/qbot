const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Approves a user\'s join request.',
    aliases: ['approvejoin', 'accept-join', 'acceptjoin'],
    usage: '<username>',
    rolesRequired: ['Ranking Permissions', 'Join Request Permissions'],
    category: 'Join Requests'
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();
        
        let username = args[0];
        if(!username) {
            embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({embeds: [embed] });
        }

        let id;
        try {
            id = await roblox.getIdFromUsername(username);
        } catch (err) {
            embed.setDescription(`${username} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({embeds: [embed] });
        }

        let joinRequestInfo;
        try {
            joinRequestInfo = await roblox.handleJoinRequest(client.config.groupId, id, true);
        } catch (err) {
            console.log(`Error: ${err}`);
            embed.setDescription('There was an error handling that join request. Maybe it doesn\'t exist?');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({embeds: [embed] });
        }

        embed.setDescription(`**Success!** Approved ${username}'s join request.`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        message.channel.send({embeds: [embed] });

        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Approve Join Request\n**User:** ${username} (\`${id}\`)`);
            logEmbed.setColor(client.config.colors.info);
            logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            logEmbed.setTimestamp();
            logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`);
            return logChannel.send({embeds: [logEmbed] });
        } else {
            return;
        }
    }
}
