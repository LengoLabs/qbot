const roblox = require('noblox.js');
const chalk = require('chalk');

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
    let rank = Number(args[1]);
    if(!rank){
        let midrank = args.slice(1).join(' ');
        if(!midrank){
            return message.channel.send({embed: {
                color: 16733013,
                description: "The rank argument is required.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                }
            }});
        }
        newrank = await getRankFromName(midrank, client.config.groupId);
    } else {
        newrank = rank;
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
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let rankInGroup = await getRankID(client.config.groupId, id);
    let rankNameInGroup = await getRankName(client.config.groupId, id);
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
    if(newrank == 'NOT_FOUND'){
        return message.channel.send({embed: {
            color: 16733013,
            description: "The specified rank could not be found.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
        }});
    }
    let setRankResponse;
    try {
        setRankResponse = await roblox.setRank(client.config.groupId, id, newrank);
    } catch (err) {
        console.log(chalk.red('An error occured when running the setrank command: ' + err));
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
    message.channel.send({embed: {
        color: 9240450,
        description: `**Success!** Ranked ${username} to ${newRankName} (${setRankResponse.rank})`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL()
        }
    }});
    if(client.config.logchannelid === 'false') return;
    let logchannel = await message.guild.channels.cache.get(client.config.logchannelid);
    logchannel.send({embed: {
        color: 2127726,
        description: `<@${message.author.id}> has ranked ${username} from ${rankNameInGroup} (${rankInGroup}) to ${newRankName} (${setRankResponse.rank}).`,
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
