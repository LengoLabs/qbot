const Discord = require('discord.js');
const fs = require('fs');
const commandList = [];
require('dotenv').config();
let prefix = process.env.prefix;

fs.readdir('./commands', async (err, files) => {
    if(err) throw new Error(err);
    files.forEach(file => {
        if(!file.endsWith('.js')) return;
        const cmdFile = require(`../commands/${file}`);
        commandList.push({
            file: cmdFile
        });
    });
});

exports.run = async (client, message, args) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(7948427);
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
    let embedDescription = `**Here are my commands:**\n`;

    for(var i = 0; i < commandList.length; i++) {
        let helpStrFromFile = await commandList[i].file.help();
        let name = helpStrFromFile.substring(0, helpStrFromFile.indexOf("|"));
        let description = helpStrFromFile.substring(helpStrFromFile.indexOf("|") + 1, helpStrFromFile.length);
        let helpStr = `\`${prefix}${name}\` - ${description}\n`;
        embedDescription += helpStr;
    }

    embed.setDescription(embedDescription);
    return message.channel.send(embed);
}

exports.help = async() => {
    let name = "help";
    let description = "Shows this list of commands.";
    return `${name}|${description}`;
}
