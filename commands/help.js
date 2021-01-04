const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
const _ = require('lodash');
require('dotenv').config();

const config = {
    description: 'Shows a list of commands.',
    aliases: [],
    usage: '[command name]',
    rolesRequired: [],
    category: 'Info'
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();

        let commandQuery = args[0];
        if(commandQuery) {
            let command = client.commandList.find(c => c.name.toLowerCase() === commandQuery.toLowerCase() || c.config.aliases.map(a => a.toLowerCase()).includes(commandQuery.toLowerCase()));
            if(command) {
                embed.setDescription(`**${command.name} - Command Info**`);
                if(command.config.aliases.length !== 0) embed.addField('Aliases', command.config.aliases.join(', '));
                embed.addField('Usage', `\`${process.env.prefix}${command.name}${command.config.usage ? ` ${command.config.usage}` : ''}\``, true);
                embed.addField('Category', command.config.category, true);
                if(command.config.rolesRequired.length !== 0) embed.addField('Roles Required', command.rolesRequired.join(', '), true);
                embed.setColor(client.constants.colors.info);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send(embed);
            }
        }

        let categories = _.groupBy(client.commandList, c => c.config.category);
        for (const categoryName of Object.keys(categories)) {
            let category = categories[categoryName];
            let commandString = category.map(c => `\`${process.env.prefix}${c.name}${c.config.usage ? ` ${c.config.usage}` : ''}\` - ${c.config.description}`).join('\n');
            embed.addField(`${categoryName}`, `${commandString}`);
        }
        embed.setDescription('Here is a list of the bot commands:');
        embed.setColor(client.constants.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
    }
}
