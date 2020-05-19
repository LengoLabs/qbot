const roblox = require('noblox.js');
const chalk = require('chalk');
const verificationChecks = require('../verificationchecks.js');

async function getRankName(func_group, func_user){
    let rolename = await roblox.getRankNameInGroup(func_group, func_user);
    return rolename;
}

async function getRankID(func_group, func_user){
    let role = await roblox.getRankInGroup(func_group, func_user);
    return role;
}

async function getRankFromName(func_rankname, func_group){
    let roles = await roblox.getRoles(func_group);
    let role = await roles.find(rank => rank.name == func_rankname);
    if(!role){
        return 'NOT_FOUND';
    }
    return role.rank;
}

exports.run = async (client, message, args) => {
    if(!message.member.roles.cache.some(role =>["Ranking Permissions"].includes(role.name))){
        return message.channel.send({embed: {
            color: 16733013,
            description: "You need the `Ranking Permissions` role to run this command.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }})
    }
    let username = args[0];
    if(!username){
        return message.channel.send({embed: {
            color: 16733013,
            description: "The username argument is required.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let id;
    try {
        id = await roblox.getIdFromUsername(username);
    } catch {
        return message.channel.send({embed: {
            color: 16733013,
            description: `Oops! ${username} is not a Roblox user. Perhaps you misspelled?`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }
    let rankInGroup = await getRankID(client.config.groupId, id);
    let rankNameInGroup = await getRankName(client.config.groupId, id);
    let ratelimitedresources = 0;
    let bloxlinkresponse = await ratelimits.bloxlink(message.author.id);
    if(bloxlinkresponse.msg === 'ratelimited') ratelimitedresources = ratelimitedresources + 1;
    let roverresponse = await ratelimits.rover(message.author.id);
    if(roverresponse.msg === 'ratelimited') ratelimitedresources = ratelimitedresources + 1;
    if(ratelimitedresources !== 2){
        return message.channel.send({embed: {
            color: 16733013,
            description: "The bot is currently ratelimited. Please try again in a minute.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let verifiedId = 'notfound';
    if(bloxlinkresponse.msg !== 'notfound'){
        verifiedId = bloxlinkresponse.id;
    }
    if(verifiedId !== 'notfound' && roverresponse.msg !== 'notfound'){
        verifiedId = roverresponse.id;
    }
    if(verifiedid === 'notfound'){
      member.send({embed: {
          color: 16733013,
          description: "It looks like you are not verified with Bloxlink or Rover. Please verify yourself using [this link](https://verify.eryn.io/)!",
          author: {
              name: message.author.tag,
              icon_url: message.author.displayAvatarURL()
          }
      }})
    }
    if(id == verifiedid){
        return message.channel.send({embed: {
            color: 16733013,
            description: "You can't rank yourself.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let verifiedUserRankInGroup = await getRankID(client.config.groupId, verifiedId);
    if(rankInGroup <= verifiedUserRankInGroup){
        return message.channel.send({embed: {
            color: 16733013,
            description: "You can't rank someone with the same or higher rank then you.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    if(client.config.maximumRank <= rankInGroup){
        return message.channel.send({embed: {
            color: 16733013,
            description: "This rank cannot be ranked by this bot.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let promoteResponse;
    try {
        promoteResponse = await roblox.promote(client.config.groupId, id);
    } catch (err) {
        console.log(chalk.red('An error occured when running the promote command: ' + err));
        return message.channel.send({embed: {
            color: 16733013,
            description: `Oops! An unexpected error has occured. It has been logged to the bot console.`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let newRankName = await getRankName(client.config.groupId, id);
    let newRank = await getRankID(client.config.groupId, id);
    message.channel.send({embed: {
        color: 9240450,
        description: `**Success!** Promoted ${username} to ${promoteResponse.newRole.name} (${promoteResponse.newRole.rank})`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL()
        }
    }});
    if(client.config.logchannelid === 'false') return;
    let logchannel = await message.guild.channels.cache.get(client.config.logchannelid);
    logchannel.send({embed: {
        color: 2127726,
        description: `<@${message.author.id}> has promoted ${username} from ${rankNameInGroup} (${rankInGroup}) to ${promoteResponse.newRole.name} (${promoteResponse.newRole.rank}).`,
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
