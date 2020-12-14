const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Shows group info or user info.',
    aliases: [],
    usage: '[username/user id] [--id]',
    rolesRequired: [],
    category: 'Info'
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();
        let userQuery = args[0];
        if(!userQuery) {
            let group = await client.utils.getGroup(Number(process.env.groupId));
            embed.setDescription(`**${group.name} - Group Info**\n\nID: \`${group.id}\`\nOwner: ${group.owner.username} (\`${group.owner.userId}\`)\nMember Count: ${group.memberCount}\n\n${group.publicEntryAllowed ? `[Join Group](https://roblox.com/groups/${group.id})` : `[Request to Join Group](https://roblox.com/groups/${group.id})`}`);
            embed.setColor(client.constants.colors.info);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }

        let id;
        try {
            id = await roblox.getIdFromUsername(username);
        } catch (err) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.constants.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }

        let user;
        try {
            user = await client.utils.getUser(id);
        } catch (err) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.constants.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }

        let rankInGroup = await roblox.getRankInGroup(Number(process.env.groupId), id);
        let rankNameInGroup = await roblox.getRankNameInGroup(Number(process.env.groupId), id);
        embed.setDescription(`**${user.Username} - User Info**\n\nID: \`${user.Id}\`\nGroup Rank: ${rankNameInGroup} (\`${rankInGroup}\`)\n\n[Roblox Profile](https://roblox.com/users/${user.Id}/profile)`);
        embed.setColor(client.constants.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
    }
}
