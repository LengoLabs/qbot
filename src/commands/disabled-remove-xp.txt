const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Decreases a user\'s XP count.',
    aliases: ['removexp'],
    usage: '<username> <decrement>',
    rolesRequired: ['Ranking Permissions', 'XP Permissions'],
    category: 'XP System',
    slashOptions: [
        {
            type: 'STRING',
            name: 'username',
            description: 'The username of whose XP you want to remove.',
            required: true
        },
        {
            type: 'NUMBER',
            name: 'decrement',
            description: 'How much XP do you want to remove?',
            required: true
        }
    ]
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();

        if(!client.config.xpRankup.enabled) {
            embed.setDescription(`The XP Rankup system must be enabled in the bot configuration.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

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

        if(client.config.verificationChecks === true) {
            let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);
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
                embed.setDescription('You can\'t remove XP from yourself!');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
            if(rankInGroup >= linkedUserRankInGroup) {
                embed.setDescription('You can only change the XP count of people with a rank lower than yours.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }
        }

        let decrement = args[1];
        if(!decrement) {
            embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }
        if(isNaN(decrement)) {
            embed.setDescription(`Invalid arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let beforeChangeXP = Number(xpInfo[0].dataValues.xp);
        xpInfo[0].decrement('xp', { by: decrement });
        let afterChangeXP = beforeChangeXP - Number(decrement);

        let displayUsername = await roblox.getUsernameFromId(id);
        embed.setDescription(`Removed \`${decrement}xp\` from ${displayUsername}'s XP count. They now have \`${afterChangeXP}xp\`.`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        message.channel.send({embeds: [embed] });

        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** Remove XP\n**User:** ${username} (\`${id}\`)\n**XP Change:** ${beforeChangeXP} -> ${afterChangeXP} (removed ${decrement})`);
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

        if(!client.config.xpRankup.enabled) {
            embed.setDescription(`The XP Rankup system must be enabled in the bot configuration.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        let username = args.username;
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

        if(client.config.verificationChecks === true) {
            let linkedUser = await client.utils.getLinkedUser(interaction.user.id, message.guild.id);
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
                embed.setDescription('You can\'t remove XP from yourself!');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }

            let linkedUserRankInGroup = await roblox.getRankInGroup(client.config.groupId, linkedUser);
            if(rankInGroup >= linkedUserRankInGroup) {
                embed.setDescription('You can only change the XP count of people with a rank lower than yours.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }
        }

        let decrement = args.decrement;
        if(!decrement) {
            embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
        if(isNaN(decrement)) {
            embed.setDescription(`Invalid arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let beforeChangeXP = Number(xpInfo[0].dataValues.xp);
        xpInfo[0].decrement('xp', { by: decrement });
        let afterChangeXP = beforeChangeXP - Number(decrement);

        let displayUsername = await roblox.getUsernameFromId(id);
        embed.setDescription(`Removed \`${decrement}xp\` from ${displayUsername}'s XP count. They now have \`${afterChangeXP}xp\`.`);
        embed.setColor(client.config.colors.success);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        interaction.reply(embed);

        if(client.config.logChannelId !== 'false') {
            let logEmbed = new Discord.MessageEmbed();
            let logChannel = await client.channels.fetch(client.config.logChannelId);
            logEmbed.setDescription(`**Moderator:** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n**Action:** Remove XP\n**User:** ${username} (\`${id}\`)\n**XP Change:** ${beforeChangeXP} -> ${afterChangeXP} (removed ${decrement})`);
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
