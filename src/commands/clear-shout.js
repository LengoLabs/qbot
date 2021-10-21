const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Clears the shout in the Roblox group.',
    aliases: ['clearshout'],
    usage: '',
    rolesRequired: ['Ranking Permissions', 'Shout Permissions'],
    category: 'Group Shouts',
    slashOptions: []
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();

        let shoutInfo;
        try {
            shoutInfo = await roblox.shout(client.config.groupId, '');
        } catch (err) {
            console.log(`Error: ${err}`);
            embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        embed.setDescription(`**Success!** Cleared the group shout.`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        message.channel.send({ embeds: [embed] });

        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Cleared Shout`);
            logEmbed.setColor(client.config.colors.info);
            logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            logEmbed.setTimestamp();
            return logChannel.send({ embeds: [logEmbed] });
        } else {
            return;
        }
    },
    runInteraction: async (client, interaction, args) => {
        let embed = new Discord.MessageEmbed();
    
        let shoutInfo;
        try {
            shoutInfo = await roblox.shout(client.config.groupId, '');
        } catch (err) {
            console.log(`Error: ${err}`);
            embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        embed.setDescription(`**Success!** Cleared the group shout.`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        interaction.reply({ embeds: [embed] });
    
        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n**Action:** Cleared Shout`);
            logEmbed.setColor(client.config.colors.info);
            logEmbed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            logEmbed.setTimestamp();
            return logChannel.send({ embeds: [logEmbed] });
        } else {
            return;
        }
    }
}
