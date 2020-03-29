const roblox = require('noblox.js');
const chalk = require('chalk');

exports.run = async (client, message, args) => {
    if(!message.member.roles.cache.some(role =>["Ranking Permissions", "Join Request Permissions"].includes(role.name))){
        return message.channel.send({embed: {
            color: 16733013,
            description: "You need the `Ranking Permissions` or `Join Request Permissions` role to run this command.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
  let username = args[0];
  if(!username){
    return message.channel.send({embed: {
      description: 'Please provide a username.',
      color: 16733013,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL()
      }
    }});
  }
  let userid;
  try {
    userid = await roblox.getIdFromUsername(username);
  } catch (err) {
    return message.channel.send({embed: {
      description: 'That user does not exist.',
      color: 16733013,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL()
      }
    }});
  }
  try {
    username = await roblox.getUsernameFromId(userid);
  } catch (err) {
    console.log(chalk.red('An error occured when running the deny-join command: ' + err));
    return message.channel.send({embed: {
      description: 'Oops! An unexpected error has occured. It has been logged to the bot console.',
      color: 16733013,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL()
      }
    }});
  }
  let denyJoinRequestResponse;
  try {
    denyJoinRequestResponse = await roblox.handleJoinRequest(client.config.groupId, userid, false);
  } catch (err) {
    return message.channel.send({embed: {
      description: 'That user does not have an active join request.',
      color: 16733013,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL()
      }
    }});
  }
  message.channel.send({embed: {
    color: 9240450,
    description: `**Success!** Denied ${username}'s join request.`,
    author: {
      name: message.author.tag,
      icon_url: message.author.displayAvatarURL()
    }
  }});
  if(client.config.logchannelid === 'false') return;
  let logchannel = await message.guild.channels.cache.get(client.config.logchannelid);
  logchannel.send({embed: {
    color: 2127726,
    description: `<@${message.author.id}> has denied ${username}'s join request.`,
    author: {
      name: message.author.tag,
      icon_url: message.author.displayAvatarURL()
    },
    footer: {
      text: 'Action Logs'
    },
    timestamp: new Date(),
    thumbnail: {
      url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`
    }
  }});
}
