const express = require('express');
const app = express();

app.get('/', (request, response) => {
     response.sendStatus(200);
});

let listener = app.listen(process.env.PORT, () => {
     console.log('Your app is currently listening on port: ' + listener.address().port);
});

const Discord = require('discord.js');
const client = new Discord.Client();
const roblox = require('noblox.js');
const chalk = require('chalk');
const figlet = require('figlet');
const config = require('./config.json');
const fs = require('fs');
client.config = config;

roblox.cookieLogin(config.cookie).catch(async err => {
    console.log(chalk.red('Issue with logging in: ' + err))
});

let commandlist = [];

let firstshout = true;
let shout;

async function onShout(){
  let shoutchannel = await client.channels.cache.get(config.shoutchannelid);
  if(firstshout == true){
    firstshout = false;
    shout = await roblox.getShout(config.groupId);
    setTimeout(onShout, 30000);
  } else {
    setTimeout(onShout, 30000);
    let currentshout = await roblox.getShout(config.groupId);
    if(currentshout.updated == shout.updated) return;
    if(currentshout.body){
      shoutchannel.send({embed: {
        color: 2127726,
        description: currentshout.body,
        author: {
          name: shout.poster.username,
          icon_url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`
        }
      }});
    } else {
      shoutchannel.send({embed: {
        color: 2127726,
          description: '*Shout cleared.*',
            author: {
              name: shout.poster.username,
              icon_url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`
            }
      }});
    }
    shout = currentshout;
  }
}
if(config.shoutchannelid !== 'false'){
  onShout();
}

fs.readdir('./commands/', async (err, files) => {
    if(err){
        return console.log(chalk.red('An error occured when checking the commands folder for commands to load: ' + err));
    }
    files.forEach(async (file) => {
        if(!file.endsWith('.js')) return;
        let commandFile = require(`./commands/${file}`);
        commandlist.push({
            file: commandFile,
            name: file.split('.')[0]
        });
    });
});

client.on('ready', async () => {
  console.log(chalk.yellow(figlet.textSync('qbot', { horizontalLayout: 'full' })));
  console.log(chalk.red(`Bot started!\n---\n`
  + `> Users: ${client.users.cache.size}\n`
  + `> Channels: ${client.channels.cache.size}\n`
  + `> Servers: ${client.guilds.cache.size}`));
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
    if(!message.content.startsWith(client.config.prefix)) return;
    const args = message.content.slice(client.config.prefix.length).split(' ');
    const commandName = args[0].toLowerCase();
    args.shift();
    const command = commandlist.findIndex((cmd) => cmd.name === commandName);
    if(command == -1) return;
    commandlist[command].file.run(client, message, args);
});

client.login(config.token);
