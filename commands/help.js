const roblox = require('noblox.js');
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config();

const config = {
    description: 'Shows a list of commands.',
    aliases: [],
    usage: '',
    rolesRequired: []
}

module.exports = {
    config,
    run: async (client, message, args) => {
        let embed = new Discord.MessageEmbed();
        let commands = client.commandList;
        let commandString = commands.map(c => `\`${c.name}${' ' + c.config.usage || ''}\` - ${c.config.description}`).join('\n');
        embed.setDescription(`Here is a list of all bot commands:\n\n${commandString}`);
        embed.setColor(client.constants.colors.info);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        return message.channel.send(embed);
    }
}