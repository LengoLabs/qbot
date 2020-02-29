const roblox = require('noblox.js');
const chalk = require('chalk');

exports.run = async (client, message, args) => {
    if(!message.member.roles.some(role =>["Ranking Permissions", "Shout Permissions"].includes(role.name))){
        return message.channel.send({embed: {
            color: 16733013,
            description: "You need the `Ranking Permissions` or `Shout Permissions` role to run this command.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }
    let msg = args.join(' ');
    if(!msg){
        return message.channel.send({embed: {
            color: 16733013,
            description: `The message argument is required.`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }
    let shoutResponse;
    try {
        shoutResponse = await roblox.shout(client.config.groupId, msg);
    } catch (err) {
        console.log(chalk.red('An error occured when running the shout command: ' + err));
        return message.channel.send({embed: {
            color: 16733013,
            description: `Oops! An unexpected error has occured. It has been logged to the bot console.`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }
    message.channel.send({embed: {
        color: 9240450,
        description: `**Success!** Posted group shout:\n`
        + `\`\`\`${msg}\`\`\``,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        }
    }});
    if(client.config.logchannelid === 'false') return;
    let logchannel = message.guild.channels.get(client.config.logchannelid);
    logchannel.send({embed: {
        color: 2127726,
        description: `<@${message.author.id}> has posted a group shout:\n`
        + `\`\`\`${msg}\`\`\``,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        },
        footer: {
            text: 'Action Logs'
        },
        timestamp: new Date()
    }});
}
