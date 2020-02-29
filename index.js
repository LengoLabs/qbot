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

let shoutEvent = roblox.onShout(client.config.groupId);

shoutEvent.on('data', async (shout) => {
  if(config.shoutchannelid === 'false') return;
  let shoutchannel = await client.channels.get(config.shoutchannelid);
  if(shout.body){
    shoutchannel.send({embed: {
            color: 2127726,
            description: shout.body,
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
});

fs.readdir('./commands/', async (err, files) => {
    if(err){
        return console.error(err);
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
    + `> Users: ${client.users.size}\n`
    + `> Channels: ${client.channels.size}\n`
    + `> Servers: ${client.guilds.size}`));
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
