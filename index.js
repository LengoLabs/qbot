const Discord = require("discord.js");
const rbx = require('noblox.js');
const roblox = require("roblox-js")
const client = new Discord.Client();
const config = require("./config.json");
const chalk = require('chalk');
const figlet = require('figlet');

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
            description: `My commands are \`${config.prefix}help\`, \`${config.prefix}setrank <user> <rank number>\`, \`${config.prefix}promote <user>\`, \`${config.prefix}demote <user>\`, \`${config.prefix}fire <user>\`, \`${config.prefix}shout <msg>\`, \`${config.prefix}clearshout\` and \`${config.prefix}getinfo <user>\`.`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    };

    if(command === "setrank") {
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
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
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
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
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
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
        if(!message.member.roles.some(r=>["Ranking Permissions"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "You need the `Ranking Permissions` role to run this command.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
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
        if(!message.member.roles.some(r=>["Ranking Permissions", "Shout Permissions"].includes(r.name)) )
        return message.channel.send({embed: {
            color: 15406156,
            description: "You need the `Ranking Permissions` or `Shout Permissions` role to run this command.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
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
        if(!message.member.roles.some(r=>["Ranking Permissions", "Shout Permissions"].includes(r.name)) )
        return message.channel.send({embed: {
            color: 15406156,
            description: "You need the `Ranking Permissions` or `Shout Permissions` role to run this command.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
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

if(command === 'getinfo'){
  let username = args[0];
  if(!username) return message.channel.send({embed: {
    description: `You did not provide the \`username\` argument.\n`
    + `\n`
    + `Usage: ${config.prefix}getinfo <username>`,
    author: {
      name: message.author.tag,
      icon_url: message.author.displayAvatarURL
    }, 
    color: 16732497
  }});
  rbx.getIdFromUsername(username).then(function (id) {
    roblox.getRankNameInGroup(config.groupId, id).then(function (rank) {
        message.channel.send({embed: {
        description: `:white_check_mark: **Information Loading..**`,
        author: {
          name: message.author.tag,
          icon_url: message.author.displayAvatarURL
                },
        color: 7456369,
        fields: [{
          name: `Username`,
          value: username,
          inline: false
        }, {
          name: `ID`,
          value: id,
          inline: false
        }, {
          name: `Group Rank`,
          value: rank,
          inline: false
        }],
        thumbnail: {
            url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`        
        }
      }})
    })
  }).catch(function (err) {
    return message.channel.send({embed: {
    description: `I couldn't find that user!`
    + `\n`
    + `You provided: ${username}`,
    author: {
      name: message.author.tag,
      icon_url: message.author.displayAvatarURL
    }, 
    color: 16732497
  }})
  })
};
}

// End of commands.
});

client.login(config.token);
