const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Ranks a user based on their current XP.',
    aliases: ['xprankup'],
    usage: '[username]',
    rolesRequired: [],
    category: 'XP System',
    slashOptions: [
        {
            type: 'STRING',
            name: 'username',
            description: 'The username of the user who you want to rank up.',
            required: false
        }
    ]
}

let getRoleNameFromRank = async (func_rank, func_group) => {
    let roles = await roblox.getRoles(func_group);
    let role = await roles.find(role => role.rank === func_rank);
    if (!role) {
        return null;
    } else {
        return role.name;
    }
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();

        let username = args[0];
        let id;
        if (!username) {
            let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);

            if (linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            if (!linkedUser) {
                embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            } else {
                id = linkedUser;
            }
        } else {
            if (!message.member.roles.cache.some(role => ['Ranking Permissions', 'XP Permissions'].includes(role.name))) {
                let embed = new Discord.MessageEmbed();
                embed.setDescription('You do not have permission to use this command.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            } else {
                try {
                    id = await roblox.getIdFromUsername(username);
                } catch (err) {
                    embed.setDescription(`${username} is not a Roblox user.`);
                    embed.setColor(client.config.colors.error);
                    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    return message.channel.send({ embeds: [embed] });
                }
            }
        }

        let displayUsername = await roblox.getUsernameFromId(id);

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let rankingTo = client.config.xpRankup.roles.reverse().find(role => xpInfo[0].dataValues.xp >= role.xpNeeded);
        if (!rankingTo) {
            embed.setDescription(`${displayUsername} is not eligible to rank up to any xp roles.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }
        let rank = rankingTo.rank;
        let rankingToName = await getRoleNameFromRank(rank, client.config.groupId);
        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);

        if (client.config.maximumRank <= rankInGroup || client.config.maximumRank <= rank) {
            embed.setDescription('This bot cannot rank this user due to the maximum rank configured.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        if (rankInGroup === 0) {
            embed.setDescription('The target user is not in the group.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        if (rank === rankInGroup) {
            embed.setDescription('You are already at the rank you can rank up to.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send({ embeds: [embed] });
        }

        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);

        embed.setDescription(`Are you sure you would like to rank ${displayUsername} to ${rankingToName} (${rank})?`);
        embed.setColor(client.config.colors.neutral);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        let msg = await message.channel.send({ content: 'Loading...' });
        await msg.edit({
            embeds: [embed],
            components: [
                new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                            .setCustomId(`xp-rankup-confirm-${msg.id}`)
                            .setLabel('Yes')
                            .setStyle('SUCCESS'),
                        new Discord.MessageButton()
                            .setCustomId(`xp-rankup-cancel-${msg.id}`)
                            .setLabel('No')
                            .setStyle('DANGER')
                    ])
            ]
        });
        let filter = (interaction) => (interaction.customId === `xp-rankup-confirm-${msg.id}` || interaction.customId === `xp-rankup-cancel-${msg.id}`) && interaction.user.id === message.author.id;
        msg.awaitMessageComponent({ filter, max: 1, time: 60000 }).then(async (collected) => {
            if (collected.size === 0) {
                embed.setDescription('Confirmation prompt timed out.');
                return collected.first().update({ embeds: [embed] });
            }

            if (collected.first().label === 'No') {
                embed.setDescription('Cancelled.');
                return collected.first().update({ embeds: [embed] });
            }

            if (collected.first().label === 'Yes') {
                let rankingInfo;
                try {
                    rankingInfo = await roblox.setRank(client.config.groupId, id, Number(rank));
                } catch (err) {
                    console.log(`Error: ${err}`);
                    embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
                    embed.setColor(client.config.colors.error);
                    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    return interaction.reply({ embeds: [embed] });
                }

                embed.setDescription(`**Success!** Ranked ${displayUsername} to ${rankingInfo.name} (${rankingInfo.rank})`);
                embed.setColor(client.config.colors.success);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                interaction.reply({ embeds: [embed] });

                if (client.config.logChannelId !== 'false') {
                    let logEmbed = new Discord.MessageEmbed();
                    let logChannel = await client.channels.fetch(client.config.logChannelId);
                    logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** XP Rankup\n**User:** ${displayUsername} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.name} (${rankingInfo.rank})\n**XP:** ${xpInfo[0].dataValues.xp}`);
                    logEmbed.setColor(client.config.colors.info);
                    logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    logEmbed.setTimestamp();
                    logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${displayUsername}`);
                    return logChannel.send({ embeds: [logEmbed] });
                } else {
                    return;
                }
            }
        });
    },
    runInteraction: async (client, interaction, args) => {
        let embed = new Discord.MessageEmbed();

        let username = args[0];
        let id;
        if (!username) {
            let linkedUser = await client.utils.getLinkedUser(interaction.user.id, interaction.guild.id);

            if (linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }

            if (!linkedUser) {
                embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            } else {
                id = linkedUser;
            }
        } else {
            if (!interaction.member.roles.cache.some(role => ['Ranking Permissions', 'XP Permissions'].includes(role.name))) {
                let embed = new Discord.MessageEmbed();
                embed.setDescription('You do not have permission to use this command.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            } else {
                try {
                    id = await roblox.getIdFromUsername(username);
                } catch (err) {
                    embed.setDescription(`${username} is not a Roblox user.`);
                    embed.setColor(client.config.colors.error);
                    embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                    return interaction.reply({ embeds: [embed] });
                }
            }
        }

        let displayUsername = await roblox.getUsernameFromId(id);

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let rankingTo = client.config.xpRankup.roles.reverse().find(role => xpInfo[0].dataValues.xp >= role.xpNeeded);
        if (!rankingTo) {
            embed.setDescription(`${displayUsername} is not eligible to rank up to any xp roles.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }
        let rank = rankingTo.rank;
        let rankingToName = await getRoleNameFromRank(rank, client.config.groupId);
        let rankInGroup = await roblox.getRankInGroup(client.config.groupId, id);

        if (client.config.maximumRank <= rankInGroup || client.config.maximumRank <= rank) {
            embed.setDescription('This bot cannot rank this user due to the maximum rank configured.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        if (rankInGroup === 0) {
            embed.setDescription('The target user is not in the group.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        if (rank === rankInGroup) {
            embed.setDescription('You are already at the rank you can rank up to.');
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        let rankNameInGroup = await roblox.getRankNameInGroup(client.config.groupId, id);
        embed.setDescription(`Are you sure you would like to rank ${displayUsername} to ${rankingToName} (${rank})?`);
        embed.setColor(client.config.colors.neutral);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        let msg = await interaction.deferReply({ fetchReply: true });
        await interaction.editReply({
            embeds: [embed],
            components: [
                new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                            .setCustomId(`xp-rankup-confirm-${msg.id}`)
                            .setLabel('Yes')
                            .setStyle('SUCCESS'),
                        new Discord.MessageButton()
                            .setCustomId(`xp-rankup-cancel-${msg.id}`)
                            .setLabel('No')
                            .setStyle('DANGER')
                    ])
            ]
        });
        let filter = (buttonInteraction) => (buttonInteraction.customId === `xp-rankup-confirm-${msg.id}` || buttonInteraction.customId === `xp-rankup-cancel-${msg.id}`) && buttonInteraction.user.id === interaction.user.id;
        msg.awaitMessageComponent({ filter, time: 60000 }).then(async (buttonInteraction) => {
            if (buttonInteraction.customId === `xp-rankup-cancel-${msg.id}`) {
                embed.setDescription('Cancelled.');
                return buttonInteraction.update({ embeds: [embed], components: [] });
            }

            if (buttonInteraction.customId === `xp-rankup-confirm-${msg.id}`) {
                let rankingInfo;
                try {
                    rankingInfo = await roblox.setRank(client.config.groupId, id, Number(rank));
                } catch (err) {
                    console.log(`Error: ${err}`);
                    embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
                    embed.setColor(client.config.colors.error);
                    embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                    return buttonInteraction.update({ embeds: [embed], components: [] });
                }

                embed.setDescription(`**Success!** Ranked ${displayUsername} to ${rankingInfo.name} (${rankingInfo.rank})`);
                embed.setColor(client.config.colors.success);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                buttonInteraction.update({ embeds: [embed], components: [] });

                if (client.config.logChannelId !== 'false') {
                    let logEmbed = new Discord.MessageEmbed();
                    let logChannel = await client.channels.fetch(client.config.logChannelId);
                    logEmbed.setDescription(`**Moderator:** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n**Action:** XP Rankup\n**User:** ${displayUsername} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.name} (${rankingInfo.rank})\n**XP:** ${xpInfo[0].dataValues.xp}`);
                    logEmbed.setColor(client.config.colors.info);
                    logEmbed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                    logEmbed.setTimestamp();
                    logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${displayUsername}`);
                    return logChannel.send({ embeds: [logEmbed] });
                } else {
                    return;
                }
            }
        }).catch((error) => {
            embed.setDescription('Confirmation prompt timed out.');
            return interaction.update({ embeds: [embed] });
        });
    }
}