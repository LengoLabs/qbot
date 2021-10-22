const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Shows group info or user info.',
    aliases: [],
    usage: '[username/user id] [--id]',
    rolesRequired: [],
    category: 'Info',
    slashOptions: [
        {
            type: 'STRING',
            name: 'query',
            description: 'The username or user id of the user whose info you want to view.',
            required: false
        },
        {
            type: 'STRING',
            name: 'flags',
            description: 'Any flags you want to add to this command. Use --id if you put a user id for the query.',
            required: false
        }
    ]
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();
        let userQuery = args[0];
        if(!userQuery) {
            let group = await client.utils.getGroup(client.config.groupId);
            embed.setDescription(`**${group.name} - Group Info**\n\nID: \`${group.id}\`\nOwner: ${group.owner.username} (\`${group.owner.userId}\`)\nMember Count: ${group.memberCount}\nShout:\n> ${!group.shout ? '*There is no shout.' : group.shout.body}\n\n${group.publicEntryAllowed ? `[Join Group](https://roblox.com/groups/${group.id})` : `[Request to Join Group](https://roblox.com/groups/${group.id})`}`);
            embed.setColor(client.config.colors.info);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let id;
        if(args[1] === '--id' || args[1] === '-id') {
            id = args[0];
        } else {
            try {
                id = await roblox.getIdFromUsername(userQuery);
            } catch (err) {
                embed.setDescription(`${userQuery} is not a Roblox user.`);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }
        }

        let user;
        try {
            user = await client.utils.getUser(id);
        } catch (err) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }
        if(user.errors) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
        embed.setDescription(`**${user.Username} - User Info**\n\nID: \`${user.Id}\`\nGroup Rank: ${rankNameInGroup} (\`${rankInGroup}\`)\n\n[Roblox Profile](https://roblox.com/users/${user.Id}/profile)`);
        embed.setColor(client.config.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send({ embeds: [embed] });
    },
    runInteraction: async (client, interaction, args) => {
        let embed = new Discord.MessageEmbed();
        let userQuery = args[0];
        if(!userQuery) {
            let group = await client.utils.getGroup(client.config.groupId);
            embed.setDescription(`**${group.name} - Group Info**\n\nID: \`${group.id}\`\nOwner: ${group.owner.username} (\`${group.owner.userId}\`)\nMember Count: ${group.memberCount}\nShout:\n> ${!group.shout ? '*There is no shout.*' : group.shout.body}\n\n${group.publicEntryAllowed ? `[Join Group](https://roblox.com/groups/${group.id})` : `[Request to Join Group](https://roblox.com/groups/${group.id})`}`);
            embed.setColor(client.config.colors.info);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        let id;
        if(args[1] === '--id' || args[1] === '-id') {
            id = args[0];
        } else {
            try {
                id = await roblox.getIdFromUsername(userQuery);
            } catch (err) {
                embed.setDescription(`${userQuery} is not a Roblox user.`);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
        }
    
        let user;
        try {
            user = await client.utils.getUser(id);
        } catch (err) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
        if(user.errors) {
            embed.setDescription(`${userQuery} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
        embed.setDescription(`**${user.Username} - User Info**\n\nID: \`${user.Id}\`\nGroup Rank: ${rankNameInGroup} (\`${rankInGroup}\`)\n\n[Roblox Profile](https://roblox.com/users/${user.Id}/profile)`);
        embed.setColor(client.config.colors.info);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        return interaction.reply({ embeds: [embed] });
    }
}
