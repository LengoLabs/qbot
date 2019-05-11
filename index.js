const Discord = require("discord.js");
const rbx = require('noblox.js');
const client = new Discord.Client();
const config = require("./config.json");

rbx.cookieLogin(config.cookie);

client.on("ready", () => {
    console.log(`Bot started! This bot is currently helping ${client.users.size} users in ${client.users.size} channels of ${client.guilds.size} servers.`);
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "help") {
        return message.channel.send({embed: {
            color: 11253955,
            description: "My commands are `q!help`, `q!setrank <user> <rank number>`, `q!promote <user>`, `q!demote <user>`, and `q!fire <user>`.",
            author: {
                name: message.author.username,
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
                    name: message.author.username,
                    icon_url: message.author.displayAvatarURL
                }
            }});
            var username = args[0]
            var rankIdentifier = Number(args[1]) ? Number(args[1]) : args[1];
            if (!rankIdentifier) return message.channel.send({embed: {
                color: 15406156,
                description: "Please specify a rank.",
                author: {
                    name: message.author.username,
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
                                    name: message.author.username,
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
                                        name: message.author.username,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            }).catch(function(err){
                                console.log('Error:' + err)
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.username,
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
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.username,
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
                    name: message.author.username,
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
                                    name: message.author.username,
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
                                        name: message.author.username,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            }).catch(function(err){
                                console.log('Error:' + err)
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.username,
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
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.username,
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
                    name: message.author.username,
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
                                    name: message.author.username,
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
                                        name: message.author.username,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            }).catch(function(err){
                                console.log('Error:' + err)
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.username,
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
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.username,
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
                    name: message.author.username,
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
                                    name: message.author.username,
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
                                        name: message.author.username,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            }).catch(function(err){
                                console.log('Error:' + err)
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "Oops! Something went wrong. The issue has been logged to the bot console.",
                                    author: {
                                        name: message.author.username,
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
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `Oops! ${username} does not exist in the Roblox user database. Perhaps you misspelled?`,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Please specify a target username.",
                    author: {
                        name: message.author.username,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

});

client.login(config.token);