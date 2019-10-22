const Discord = require("discord.js");
const rbx = require('noblox.js');
const client = new Discord.Client();
const config = require("./config.json");
const chalk = require('chalk');
const figlet = require('figlet');

const Keyv = require('keyv');
if(config.verifytoggle === 'true'){
    const keyv = new Keyv(config.db);
    keyv.on('error', err => console.log('Database error: ' + err));
}

rbx.cookieLogin(config.cookie);

client.on("ready", () => {
    console.log(chalk.yellow(figlet.textSync('qbot', { horizontalLayout: 'full' })));
    console.log(chalk.yellow(`Bot started! This bot is currently helping ${client.users.size} users in ${client.users.size} channels of ${client.guilds.size} servers.`));
});

let onShout = rbx.onShout(config.groupId);
onShout.on('data', function (shout) {
    if(config.shoutchannelid === 'false') return;
    var shoutchannel = client.channels.get(config.shoutchannelid);
    if(shout.body){
        shoutchannel.send({embed: {
            color: 11253955,
            description: shout.body,
            title: `Posted by ${shout.poster.username}`,
            footer: {
                text: 'Shout Announcement'
            },
            thumbnail: {
                url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${shout.poster.username}`
            },
            timestamp: new Date()
        }});
    } else {
        shoutchannel.send({embed: {
            color: 11253955,
            description: '*Shout cleared.*',
            title: `Posted by ${shout.poster.username}`,
            footer: {
                text: 'Shout Announcement'
            },
            thumbnail: {
                url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${shout.poster.username}`
            },
            timestamp: new Date()
        }});
    }
});
onShout.on('error', function (err) {
    console.log('Issue with shout announcements: ' + err);
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "help") {
        return message.channel.send({embed: {
            color: 11253955,
            description: `Command List:\n\`${config.prefix}help\`\n\`${config.prefix}setrank <user> <rank number>\`\n\`${config.prefix}promote <user>\`\n\`${config.prefix}demote <user>\`\n\`${config.prefix}fire <user>\`\n\`${config.prefix}shout <msg>\`\n\`${config.prefix}clearshout\`\n\`${config.prefix}verify <username>\`\n\`${config.prefix}discord-user <Roblox username>\`\n\`${config.prefix}roblox-user <tag a Discord user>\`\n\`${config.prefix}getrole\`\n\`${config.prefix}forcegetrole <tag a Discord user>\``,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    };

    if(command === "setrank") {
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
            var username = args[0]
            var rankIdentifier = Number(args[1]) ? Number(args[1]) : args[1];
            if (!rankIdentifier) return message.channel.send({embed: {
                color: 15406156,
                description: "Please specify a rank.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
            if (username){
                rbx.getIdFromUsername(username)
                .then(function(id){
                    rbx.getRankInGroup(config.groupId, id)
                    .then(function(rank){
                        if(config.maximumRank <= rank){
                            message.channel.send({embed: {
                                color: 15406156,
                                description: "This rank cannot be ranked by this bot.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.setRank(config.groupId, id, rankIdentifier)
                            .then(function(newRole){
                                message.channel.send({embed: {
                                    color: 8117429,
                                    description: `You have successfully ranked ${username} to ${rankIdentifier}!`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                                if(config.logchannelid === 'false') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> has ranked ${username} to ${rankIdentifier}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Action Logs'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Issue with setRank: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            })
                        }
                    }).catch(function(err){
                        message.channel.send({embed: {
                            color: 15406156,
                            description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "promote") {
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
            var username = args[0]
            if (username){
                rbx.getIdFromUsername(username)
                .then(function(id){
                    rbx.getRankInGroup(config.groupId, id)
                    .then(function(rank){
                        if(config.maximumRank <= rank){
                            message.channel.send({embed: {
                                color: 15406156,
                                description: "This rank cannot be promoted by this bot.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.promote(config.groupId, id)
                            .then(function(newRole){
                                message.channel.send({embed: {
                                    color: 8117429,
                                    description: `You have successfully promoted ${username}!`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                                if(config.logchannelid === 'false') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> has promoted ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Action Logs'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Issue with promote: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            })
                        }
                    }).catch(function(err){
                        message.channel.send({embed: {
                            color: 15406156,
                            description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "demote") {
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
            var username = args[0]
            if (username){
                rbx.getIdFromUsername(username)
                .then(function(id){
                    rbx.getRankInGroup(config.groupId, id)
                    .then(function(rank){
                        if(config.maximumRank <= rank){
                            message.channel.send({embed: {
                                color: 15406156,
                                description: "This rank cannot be ranked by this bot.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.demote(config.groupId, id)
                            .then(function(newRole){
                                message.channel.send({embed: {
                                    color: 8117429,
                                    description: `You have successfully demoted ${username}!`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                                if(config.logchannelid === 'false') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> has demoted ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Action Logs'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Issue with demote: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            })
                        }
                    }).catch(function(err){
                        message.channel.send({embed: {
                            color: 15406156,
                            description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "fire") {
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
            var username = args[0]
            if (username){
                rbx.getIdFromUsername(username)
                .then(function(id){
                    rbx.getRankInGroup(config.groupId, id)
                    .then(function(rank){
                        if(config.maximumRank <= rank){
                            message.channel.send({embed: {
                                color: 15406156,
                                description: "This rank cannot be ranked by this bot.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.setRank(config.groupId, id, 1)
                            .then(function(newRole){
                                message.channel.send({embed: {
                                    color: 8117429,
                                    description: `You have successfully fired ${username}!`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                                if(config.logchannelid === 'false') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> has fired ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Action Logs'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Issue with setRank (fire): ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            })
                        }
                    }).catch(function(err){
                        message.channel.send({embed: {
                            color: 15406156,
                            description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === 'shout'){
        if(!message.member.roles.some(r=>["Ranking Permissions", "Shout Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` or `Shout Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        var msg = args.slice(0).join(" ");
        if(!msg){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please specify a message. If you are trying to clear the shout, please use the \`${config.prefix}clearshout\` command instead.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
    rbx.shout(config.groupId, msg).catch(console.error);
    message.channel.send({embed: {
        color: 8117429,
        description: `Successfully sent shout.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        }
    }});
    if(config.logchannelid === 'false') return;
    var logchannel = message.guild.channels.get(config.logchannelid);
    logchannel.send({embed: {
        color: 11253955,
        description: `<@${message.author.id}> has updated the group shout.\nMessage: ${msg}`,
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

    if(command === 'clearshout'){
        if(!message.member.roles.some(r=>["Ranking Permissions", "Shout Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` or `Shout Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
    rbx.shout(config.groupId, "").catch(console.error);
    message.channel.send({embed: {
        color: 8117429,
        description: `Successfully cleared shout.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        }
    }});
    if(config.logchannelid === 'false') return;
    var logchannel = message.guild.channels.get(config.logchannelid);
    logchannel.send({embed: {
        color: 11253955,
        description: `<@${message.author.id}> has cleared the group shout.`,
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

    if(command === 'currentshout'){
        rbx.getShout(config.groupId).then(shout => {
           message.channel.send({embed: {
               color: 11253955,
               description: `**Posted by ${shout.poster.username}**\n${shout.body}`,
               author: {
                   name: message.author.tag,
                   icon_url: message.author.displayAvatarURL
               },
               thumbnail: {
                   url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
               }
           }});
        });
    }

    if(command === 'verify'){
        if(config.verifytoggle === 'false') return;
        let username = args[0];
        if(!username){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please specify a username.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let robloxuserid = await rbx.getIdFromUsername(username);
        let alreadyverified = await keyv.get(robloxuserid);
        if(alreadyverified){
            return message.channel.send({embed: {
                color: 15406156,
                description: `That user is already verified!`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        rbx.getIdFromUsername(username)
        .then(function(id){
            keyv.set(`${id}_verifycode`, message.author.id, 120000);
            keyv.set(`${id}_verifycode_discord`, message.author.id);
            message.channel.send({embed: {
                description: `Please change your Roblox status to the following message:\n\`${message.author.id}\`\nOnce you have done so, type this command:\n\`${config.prefix}verify-done ${username}\`\nThis will expire in 2 minutes.`,
                color: 11253955,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }).catch(function(err){
            message.channel.send({embed: {
                color: 15406156,
                description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        });
    }

    if(command === 'verify-done'){
        if(config.verifytoggle === 'false') return;
        let username = args[0];
        if(!username){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please specify a username.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let id = await rbx.getIdFromUsername(username);
        if(!id){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
            let code = await keyv.get(`${id}_verifycode`);
            if(!code){
                return message.channel.send({embed: {
                    description: `That user does not have a verification code assigned to them or it expired.`,
                    color: 15406156,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            let codedisc = await keyv.get(`${id}_verifycode_discord`);
            if(codedisc !== message.author.id){
                return message.channel.send({embed: {
                    description: `That code is not assigned to you.`,
                    color: 15406156,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            let status = await rbx.getStatus(id)
            if(!status){
                return message.channel.send({embed: {
                    description: `There is no status on that Roblox account.`,
                    color: 15406156,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            if(status != code){
                return message.channel.send({embed: {
                    description: `The status was not entered correctly.`,
                    color: 15406156,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            } else {
                await keyv.set(id, message.author.id);
                await keyv.set(message.author.id, id);
                let rbxrole = await rbx.getRankInGroup(config.groupId, id);
                let rbxrolename = await rbx.getRankNameInGroup(config.groupId, id);
                let discrole = await message.guild.roles.find(role => role.name === `[${rbxrole}] ${rbxrolename}`);
                let alreadyhaverole = await keyv.get(`${message.author.id}_CURRENTROLE`);
                message.channel.send({embed: {
                    description: `Your Discord account has successfully been linked to the specified Roblox account!`,
                    color: 8117429,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
                if(!discrole){
                    if(!alreadyhaverole){
                        return;
                    } else {
                        message.member.removeRole(alreadyhaverole);
                        await keyv.delete(`${message.author.id}_CURRENTROLE`);
                    }
                }
                if(!alreadyhaverole){
                    message.member.addRole(discrole.id);
                } else {
                    message.member.removeRole(alreadyhaverole);
                    message.member.addRole(discrole.id);
                }
                await keyv.set(`${message.author.id}_CURRENTROLE`, discrole.id);
            }
    }

    if(command === 'roblox-user'){
        if(config.verifytoggle === 'false') return;
        let user = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!user){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please tag a user after the command or enter their User ID.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let userid = await keyv.get(user.id);
        if(!userid){
            return message.channel.send({embed: {
                color: 15406156,
                description: `That user is not verified.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let username = await rbx.getUsernameFromId(userid);
        message.channel.send({embed: {
            description: `\`${user.user.tag}\` is linked to \`${username}\`.`,
            color: 8117429,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }

    if(command === 'discord-user'){
        if(config.verifytoggle === 'false') return;
        let user = args[0];
        if(!user){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please specify a username.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let rbxuserid = await rbx.getIdFromUsername(user);
        let userid = await keyv.get(rbxuserid);
        if(!userid){
            return message.channel.send({embed: {
                color: 15406156,
                description: `That user is not verified.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let discuser = await client.users.get(userid);
        message.channel.send({embed: {
            description: `\`${user}\` is linked to \`${discuser.tag}\`.`,
            color: 8117429,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }

    if(command === 'unverify'){
        if(config.verifytoggle === 'false') return;
        let rbxid = await keyv.get(message.author.id);
        let discid = await keyv.get(rbxid);
        if(!rbxid || !discid){
            return message.channel.send({embed: {
                color: 15406156,
                description: `You are not verified.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let isgivenrole = await keyv.get(`${message.author.id}_CURRENTROLE`);
        if(isgivenrole){
            message.member.removeRole(isgivenrole);
        }
        await keyv.delete(message.author.id);
        await keyv.delete(rbxid);
        message.channel.send({embed: {
            description: `Successfully unverified.`,
            color: 8117429,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }

    if(command === 'getrole'){
        if(config.verifytoggle === 'false') return;
        let id = await keyv.get(message.author.id);
        if(!id){
            return message.channel.send({embed: {
                color: 15406156,
                description: `The specified user is not verified.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let rbxrole = await rbx.getRankInGroup(config.groupId, id);
        let rbxrolename = await rbx.getRankNameInGroup(config.groupId, id);
        let discrole = await message.guild.roles.find(role => role.name === `[${rbxrole}] ${rbxrolename}`);
        let alreadyhaverole = await keyv.get(`${message.author.id}_CURRENTROLE`);
        if(!discrole){
            if(!alreadyhaverole){
                return message.channel.send({embed: {
                    description: `Successfully refreshed the specified user's roles.`,
                    color: 8117429,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            } else {
                message.member.removeRole(alreadyhaverole);
                await keyv.delete(`${message.author.id}_CURRENTROLE`);
                message.channel.send({embed: {
                    description: `Successfully refreshed the specified user's roles.`,
                    color: 8117429,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
        }
        if(!alreadyhaverole){
            message.member.addRole(discrole.id);
        } else {
            message.member.removeRole(alreadyhaverole);
            message.member.addRole(discrole.id);
        }
        await keyv.set(`${message.author.id}_CURRENTROLE`, discrole.id);
        message.channel.send({embed: {
            description: `Successfully refreshed your roles.`,
            color: 8117429,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }

    if(command === 'forcegetrole'){
        if(config.verifytoggle === 'false') return;
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name))){
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let username = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!username){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Please tag a Discord user after the command or put their User ID.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let id = await keyv.get(username.id);
        if(!id){
            return message.channel.send({embed: {
                color: 15406156,
                description: `The specified user is not verified.`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
        let rbxrole = await rbx.getRankInGroup(config.groupId, id);
        let rbxrolename = await rbx.getRankNameInGroup(config.groupId, id);
        let discrole = await message.guild.roles.find(role => role.name === `[${rbxrole}] ${rbxrolename}`);
        let alreadyhaverole = await keyv.get(`${username.id}_CURRENTROLE`);
        if(!discrole){
            if(!alreadyhaverole){
                return message.channel.send({embed: {
                    description: `Successfully refreshed the specified user's roles.`,
                    color: 8117429,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            } else {
                username.removeRole(alreadyhaverole);
                await keyv.delete(`${username.id}_CURRENTROLE`);
                message.channel.send({embed: {
                    description: `Successfully refreshed the specified user's roles.`,
                    color: 8117429,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
        }
        if(!alreadyhaverole){
            username.addRole(discrole.id);
        } else {
            username.removeRole(alreadyhaverole);
            username.addRole(discrole.id);
        }
        await keyv.set(`${username.id}_CURRENTROLE`, discrole.id);
        message.channel.send({embed: {
            description: `Successfully refreshed the specified user's roles.`,
            color: 8117429,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    }

// End of commands.
});

client.login(config.token);
