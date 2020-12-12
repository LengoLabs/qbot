const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Ranks a user based on their current XP.',
    aliases: [],
    usage: '',
    rolesRequired: []
}

let getRoleNameFromRank = async (func_rank, func_group) => {
    let roles = await roblox.getRoles(func_group);
    let role = await roles.find(role => role.rank === func_rank);
    if(!role) {
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
        if(!username){
            let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);

            if(linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.constants.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send(embed);
            }

            if(!linkedUser) {
                embed.setDescription(`Missing arguments.\n\nUsage: \`${process.env.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
                embed.setColor(client.constants.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send(embed);
            } else {
                id = linkedUser;
            }
        } else {
            if(!message.member.roles.cache.some(role => ['Ranking Permissions', 'XP Permissions'].includes(role.name))) {
                let embed = new Discord.MessageEmbed();
                embed.setDescription('You do not have permission to use this command.');
                embed.setColor(client.constants.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send(embed);
            } else {
                id = await roblox.getIdFromUsername(username).catch(async (err) => {
                    embed.setDescription(`${username} is not a Roblox user.`);
                    embed.setColor(client.constants.colors.error);
                    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    return message.channel.send(embed);
                });
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

        let rankingTo = client.constants.xpRankup.roles.reverse().find(role => xpInfo[0].dataValues.xp > role.rank);
        if(!rankingTo) {
            embed.setDescription(`${displayUsername} is not eligible to rank up to any xp roles.`);
            embed.setColor(client.constants.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }
        let rank = rankingTo.rank;
        let rankingToName = await getRoleNameFromRank(rank, Number(process.env.groupId));
        let rankInGroup = await roblox.getRankInGroup(Number(process.env.groupId), id);
        let rankNameInGroup = await roblox.getRankNameInGroup(Number(process.env.groupId), id);

        let filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        embed.setDescription(`Are you sure you would like to rank ${displayUsername} to ${rankingToName} (${rank})?`);
        embed.setColor(client.constants.colors.neutral);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        let msg = await message.channel.send(embed);
        await msg.react('✅');
        await msg.react('❌');
        msg.awaitReactions(filter, { max: 1, time: 60000 }).then(async (collected) => {
            if(collected.size === 0) {
                msg.reactions.removeAll();
                embed.setDescription('Confirmation prompt timed out.');
                return msg.edit(embed);
            }
            
            if(collected.first().emoji.name === '❌'){
                msg.reactions.removeAll();
                embed.setDescription('Cancelled.');
                return msg.edit(embed);
            }

            if(collected.first().emoji.name === '✅'){
                msg.reactions.removeAll();
                
                let rankingInfo;
                try {
                    rankingInfo = await roblox.setRank(Number(process.env.groupId), id, Number(rank));
                } catch (err) {
                    console.log(`Error: ${err}`);
                    embed.setDescription('Oops! An unexpected error has occured. The bot owner can check the bot logs for more information.');
                    embed.setColor(client.constants.colors.error);
                    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    return message.channel.send(embed);
                }
        
                embed.setDescription(`**Success!** Ranked ${username} to ${rankingInfo.name} (${rankingInfo.rank})`);
                embed.setColor(client.constants.colors.success);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                msg.edit(embed);
        
                if(process.env.logChannelId !== 'false') {
                    let logEmbed = new Discord.MessageEmbed();
                    let logChannel = await client.channels.fetch(process.env.logChannelId);
                    logEmbed.setDescription(`**Moderator:** <@${message.author.id}> (\`${message.author.id}\`)\n**Action:** XP Rankup\n**User:** ${username} (\`${id}\`)\n**Rank Change:** ${rankNameInGroup} (${rankInGroup}) -> ${rankingInfo.name} (${rankingInfo.rank})\n**XP:** ${xpInfo[0].dataValues.xp}`);
                    logEmbed.setColor(client.constants.colors.info);
                    logEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                    logEmbed.setTimestamp();
                    logEmbed.setThumbnail(`https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`);
                    return logChannel.send(logEmbed);
                } else {
                    return;
                }
            }
        });
    }
}
