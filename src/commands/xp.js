const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Views a user\'s XP.',
    aliases: [],
    usage: '<username (optional if verified)>',
    rolesRequired: [],
    category: 'XP System',
    slashOptions: [
        {
            type: 'STRING',
            name: 'username',
            description: 'The username of the user whose XP you want to view.',
            required: false
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
        let id;
        if(!username){
            let linkedUser = await client.utils.getLinkedUser(message.author.id, message.guild.id);

            if(linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            }

            if(!linkedUser) {
                embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send({ embeds: [embed] });
            } else {
                id = linkedUser;
            }
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

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let displayUsername = await roblox.getUsernameFromId(id);
        embed.setDescription(`${displayUsername} has \`${xpInfo[0].dataValues.xp}xp\`.`);
        embed.setColor(client.config.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send({ embeds: [embed] });
    },
    runInteraction: async (client, interaction, args) => {
        let embed = new Discord.MessageEmbed();

        if(!client.config.xpRankup.enabled) {
            embed.setDescription(`The XP Rankup system must be enabled in the bot configuration.`);
            embed.setColor(client.config.colors.error);
            embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        let username = args[0];
        let id;
        if(!username){
            let linkedUser = await client.utils.getLinkedUser(interaction.user.id, interaction.guild.id);

            if(linkedUser === 'RATE_LIMITS') {
                embed.setDescription('Verification checks are currently on cooldown.');
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            }

            if(!linkedUser) {
                embed.setDescription(`Missing arguments.\n\nUsage: \`${client.config.prefix}${path.basename(__filename).split('.')[0]}${' ' + config.usage || ''}\``);
                embed.setColor(client.config.colors.error);
                embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
                return interaction.reply({ embeds: [embed] });
            } else {
                id = linkedUser;
            }
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

        let xpInfo = await client.databases.xp.findOrCreate({
            where: {
                userId: id
            },
            defaults: {
                userId: id,
                xp: 0
            }
        });

        let displayUsername = await roblox.getUsernameFromId(id);
        embed.setDescription(`${displayUsername} has \`${xpInfo[0].dataValues.xp}xp\`.`);
        embed.setColor(client.config.colors.info);
        embed.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL());
        return interaction.reply({ embeds: [embed] });
    }
}
