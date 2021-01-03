const express = require('express');
const app = express();

app.get('/', (request, response) => {
    response.sendStatus(200);
});

const listener = app.listen(process.env.PORT, () => {
    console.log('Your app is currently listening on port: ' + listener.address().port);
});

const Discord = require('discord.js');
const client = new Discord.Client();
const roblox = require('noblox.js');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const constants = require('./constants.js');
const utils = require('./utils.js');
require('dotenv').config();

roblox.setCookie(process.env.cookie).catch(async err => {
    console.log(chalk.red('Issue with logging in: ' + err));
});

let commandList = [];
client.commandList = commandList;
client.constants = constants;
client.utils = utils;
client.databases = {};

const cooldowns = new Discord.Collection();

const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '.data/db.sqlite',
    logging: false
});

const xpDatabase = sequelize.define('xp', {
    userId: Sequelize.STRING,
    xp: Sequelize.INTEGER
});
xpDatabase.sync();
client.databases.xp = xpDatabase;

let firstShout = true;
let shout;

const onShout = async () => {
    let embed = new Discord.MessageEmbed();
    let shoutChannel = await client.channels.cache.get(process.env.shoutChannelId);
    if(firstShout == true){
        firstShout = false;
        shout = await roblox.getShout(Number(process.env.groupId));
        setTimeout(onShout, 30000);
    } else {
        setTimeout(onShout, 30000);
        let currentShout = await roblox.getShout(Number(process.env.groupId));
        if(currentShout.body == shout.body) return;
        if(currentShout.body){
            embed.setDescription(`${currentShout.body}`);
            embed.setColor(client.constants.colors.info);
            embed.setAuthor(currentShout.poster.username, `https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`);
            shoutChannel.send(embed);
        } else {
            embed.setDescription(`*Shout cleared.*`);
            embed.setColor(client.constants.colors.info);
            embed.setAuthor(currentShout.poster.username, `https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`);
            shoutChannel.send(embed);
        }
        shout = currentShout;
    }
}
if(process.env.shoutChannelId !== 'false'){
    setTimeout(onShout, 15000);
}

fs.readdir('./commands/', async (err, files) => {
    if(err){
        return console.log(chalk.red('An error occured when checking the commands folder for commands to load: ' + err));
    }
    files.forEach(async (file) => {
        if(!file.endsWith('.js')) return;
        let commandFile = require(`./commands/${file}`);
        commandList.push({
            file: commandFile,
            name: file.split('.')[0],
            config: commandFile.config
        });
    });
});

client.on('ready', async () => {
    console.log(`${chalk.hex(client.constants.colors.info)(figlet.textSync('qbot', { horizontalLayout: 'full' }))}\n`);
    console.log(`${chalk.hex('#60bf85')('Bot started!')}\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`
    + `${chalk.hex('#ffaa2b')('>')} ${chalk.hex('#7289DA')(`Servers: ${chalk.hex('#4e5f99')(`${client.guilds.cache.size}`)}`)}\n`
    + `${chalk.hex('#ffaa2b')('>')} ${chalk.hex('#7289DA')(`Channels: ${chalk.hex('#4e5f99')(`${client.channels.cache.size}`)}`)}`);
    let botstatus = fs.readFileSync('./bot-status.json');
    botstatus = JSON.parse(botstatus);
    if(botstatus.activity == 'false') return;
    if(botstatus.activitytype == 'STREAMING'){
        client.user.setActivity(botstatus.activitytext, {
            type: botstatus.activitytype,
            url: botstatus.activityurl
        });
    } else {
        client.user.setActivity(botstatus.activitytext, {
            type: botstatus.activitytype
        });
    }
});

client.on('message', async (message) => {
    if(message.author.bot) return;
    if(!message.content.startsWith(process.env.prefix)) return;
    const args = message.content.slice(process.env.prefix.length).split(' ');
    const commandName = args[0].toLowerCase();
    args.shift();
    const command = commandList.find((cmd) => cmd.name === commandName || cmd.config.aliases.includes(commandName));
    if(!command) return;

    if(command.config.rolesRequired.length > 0) {
        if(!message.member.roles.cache.some(role => command.config.rolesRequired.includes(role.name))) {
            let embed = new Discord.MessageEmbed();
            embed.setDescription('You do not have permission to use this command.');
            embed.setColor(client.constants.colors.error);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.channel.send(embed);
        }
    }
    
    if(command.config.cooldown) {
        if(!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
        let currentDate = Date.now();
        let userCooldowns = cooldowns.get(command.name);
        let cooldownAmount = (command.config.cooldown || 3) * 1000;
        if(userCooldowns.has(message.author.id)) {
            let expirationDate = userCooldowns.get(message.author.id) + cooldownAmount;
            if(currentDate < expirationDate) {
                let timeLeft = Math.round((expirationDate - currentDate) / 1000);
                let embed = new Discord.MessageEmbed();
                embed.setDescription(`This command is currently on cooldown. Please try again in ${timeLeft.toString()} seconds`);
                embed.setColor(client.constants.colors.error);
                embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
                return message.channel.send(embed);
            } else {
                userCooldowns.set(message.author.id, currentDate);
            }
        } else {
            userCooldowns.set(message.author.id, currentDate);
        }
    }

    command.file.run(client, message, args);
});

client.login(process.env.token);
