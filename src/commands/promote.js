const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Promotes a user in the Roblox group.',
    aliases: [],
    usage: '<username>',
    rolesRequired: ['Ranking Permissions'],
    category: 'Ranking',
    slashOptions: [
        {
            type: 'STRING',
            name: 'username',
            description: 'The username of the user you want to promote.',
            required: true
        }
    ]
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
            return message.channel.send({ embeds: [embed] });
        }

        let id;
        try {
            id = await roblox.getIdFromUsername(username);
        } catch (err) {
            embed.setDescription(`${username} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
        let rankingTo = rankInGroup + 1;
        if(client.config.maximumRank <= rankInGroup || client.config.maximumRank <= rankInGroup + 1) {
            embed.setDescription('This bot cannot rank this user due to the maximum rank configured.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        if(rankInGroup === 0){
            embed.setDescription('That user is not in the group.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);
        if(client.config.verificationChecks === true) {
            if(!linkedUser) {
                embed.setDescription('You must be verified on either of the sites below to use this command.\n\n**Bloxlink:** https://blox.link\n**RoVer:** https://verify.eryn.io');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            if(linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            if(linkedUser == id) {
                embed.setDescription('You can\'t rank yourself!');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
            if(rankInGroup >= linkedUserRankInGroup || rankingTo >= linkedUserRankInGroup) {
                embed.setDescription('You can only rank people with a rank lower than yours, to a rank that is also lower than yours.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }
        }

        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
        let rankingInfo;
        try {
            rankingInfo = await roblox.promote(client.config.groupId, id);
        } catch (err) {
            console.log(`Error: ${err}`);
            embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }
        
        embed.setDescription(`**Success!** Promoted ${username} to ${rankingInfo.newRole.name} (${rankingInfo.newRole.rank}).`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        message.channel.send({ embeds: [embed] });

        if(linkedUser) {
            let linkedUserName = await roblox.getUsernameFromId(linkedUser);
            await client.recordRankEvent({
                userId: linkedUser,
                username: linkedUserName,
                rank: rankingTo
            });
        }

        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Promotion\n**User:** ${username} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.newRole.name} (${rankingInfo.newRole.rank})`);
            logEmbed.setColor(client.config.colors.info);
            logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            logEmbed.setTimestamp();
            logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`);
            return logChannel.send({ embeds: [logEmbed] });
        } else {
            return;
        }
    },
    runInteraction: async (client, interaction, args) => {
        let embed = new Discord.MessageEmbed();
    
        let username = args[0];
        if(!username) {
            embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        let id;
        try {
            id = await roblox.getIdFromUsername(username);
        } catch (err) {
            embed.setDescription(`${username} is not a Roblox user.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);
        let rankingTo = rankInGroup + 1;
        if(client.config.maximumRank <= rankInGroup || client.config.maximumRank <= rankInGroup + 1) {
            embed.setDescription('This bot cannot rank this user due to the maximum rank configured.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        if(rankInGroup === 0){
            embed.setDescription('That user is not in the group.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
    
        let linkedUser = await client.utils.getLinkedUser(interaction.user.id, interaction.guild.id);
        if(client.config.verificationChecks === true) {
            if(!linkedUser) {
                embed.setDescription('You must be verified on either of the sites below to use this command.\n\n**Bloxlink:** https://blox.link\n**RoVer:** https://verify.eryn.io');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
    
            if(linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
    
            if(linkedUser == id) {
                embed.setDescription('You can\'t rank yourself!');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
    
            let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
            if(rankInGroup >= linkedUserRankInGroup || rankingTo >= linkedUserRankInGroup) {
                embed.setDescription('You can only rank people with a rank lower than yours, to a rank that is also lower than yours.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
        }
    
        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
        let rankingInfo;
        try {
            rankingInfo = await roblox.promote(client.config.groupId, id);
        } catch (err) {
            console.log(`Error: ${err}`);
            embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
        
        embed.setDescription(`**Success!** Promoted ${username} to ${rankingInfo.newRole.name} (${rankingInfo.newRole.rank}).`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        interaction.reply({ embeds: [embed] });
    
        if(linkedUser) {
            let linkedUserName = await roblox.getUsernameFromId(linkedUser);
            await client.recordRankEvent({
                userId: linkedUser,
                username: linkedUserName,
                rank: rankingTo
            });
        }
    
        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n**Action:** Promotion\n**User:** ${username} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.newRole.name} (${rankingInfo.newRole.rank})`);
            logEmbed.setColor(client.config.colors.info);
            logEmbed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            logEmbed.setTimestamp();
            logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`);
            return logChannel.send({ embeds: [logEmbed] });
        } else {
            return;
        }
    }
}
