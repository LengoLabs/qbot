const Discord = require("discord.js");
const rbx = require('noblox.js');
const client = new Discord.Client();
const config = require("./config.json");
const chalk = require('chalk');
const figlet = require('figlet');

rbx.cookieLogin(config.cookie);

client.on("ready", async () => {
    console.log(chalk.yellow(figlet.textSync('qbot', { horizontalLayout: 'full' })));
    console.log(chalk.yellow(`Бот начался! Этот бот в настоящее время помогает ${client.users.size} пользователи в ${client.users.size} каналы ${client.guilds.size} серверы.`));
});

async function getRankName(func_group, func_user){
    let rolename = await rbx.getRankNameInGroup(func_group, func_user);
    return rolename;
}

async function getRankID(func_group, func_user){
    let role = await rbx.getRankInGroup(func_group, func_user);
    return role;
}

async function GetRankFromName(func_rankname, func_group){
    let roles = await rbx.getRoles(func_group);
    let role = await roles.find(rank => rank.name == func_rankname);
    if(!role){
        return 'НЕ_НАЙДЕН';
    }
    return role.rank;
}

let onShout = rbx.onShout(config.groupId);
onShout.on('data', function (shout) {
    if(config.shoutchannelid === 'false') return;
    var shoutchannel = client.channels.get(config.shoutchannelid);
    if(shout.body){
        shoutchannel.send({embed: {
            color: 11253955,
            description: shout.body,
            title: `Сообщение от ${shout.poster.username}`,
            footer: {
                text: 'Кричать Объявление'
            },
            thumbnail: {
                url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${shout.poster.username}`
            },
            timestamp: new Date()
        }});
    } else {
        shoutchannel.send({embed: {
            color: 11253955,
            description: '*Крик очищен.*',
            title: `Сообщение от ${shout.poster.username}`,
            footer: {
                text: 'Кричать Объявление'
            },
            thumbnail: {
                url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${shout.poster.username}`
            },
            timestamp: new Date()
        }});
    }
});
onShout.on('error', function (err) {
    console.log('Проблема с криками: ' + err);
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "Помогите") {
        return message.channel.send({embed: {
            color: 11253955,
            description: `Мои команды \`${config.prefix}Помогите\`, \`${config.prefix}setrank <пользователь> <номер ранга>\`, \`${config.prefix}promote <user>\`, \`${config.prefix}demote <user>\`, \`${config.prefix}fire <user>\`, \`${config.prefix}shout <msg>\`, and \`${config.prefix}clearshout\`.`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    };

    if(command === "установитьранг") {
        if(!message.member.roles.some(r=>["Ранжирование разрешений"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "Для запуска этой команды вам нужна роль 'Ранжирование разрешений'.",
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
            var username = args[0]
            var rankIdentifier = Number(args[1]);
            if (!rankIdentifier){
                var rankIdentifier = args.slice(1).join(' ');
                if(!rankIdentifier){
                    return message.channel.send({embed: {
                        color: 15406156,
                        description: "Пожалуйста, укажите ранг.",
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                }
                GetRankFromName(rankIdentifier, config.groupId).then(function(result){
                    rankIdentifier = result;
                });
            }
            if (username){
                rbx.getIdFromUsername(username)
                .then(function(id){
                    rbx.getRankInGroup(config.groupId, id)
                    .then(function(rank){
                        if(config.maximumRank <= rank){
                            message.channel.send({embed: {
                                color: 15406156,
                                description: "Этот бот не может быть ранжирован этим ботом.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            if(rankIdentifier == 'НЕ_НАЙДЕН'){
                                return message.channel.send({embed: {
                                    color: 15406156,
                                    description: "Ранг не найден.",
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    }
                                }});
                            }
                            rbx.setRank(config.groupId, id, rankIdentifier)
                            .then(function(newRole){
                                getRankName(config.groupId, id)
                                .then(function(rolename){
                                    message.channel.send({embed: {
                                        color: 8117429,
                                        description: `Вы успешно оценили ${username} в ${rolename} (${rankIdentifier})!`,
                                        author: {
                                            name: message.author.tag,
                                            icon_url: message.author.displayAvatarURL
                                        }
                                    }});
                                    if(config.logchannelid === 'false') return;
                                    var logchannel = message.guild.channels.get(config.logchannelid);
                                    logchannel.send({embed: {
                                        color: 11253955,
                                        description: `<@${message.author.id}> оценил ${username} в ${rolename} (${rankIdentifier}).`,
                                        author: {
                                            name: message.author.tag,
                                            icon_url: message.author.displayAvatarURL
                                        },
                                        footer: {
                                            text: 'Журналы действий'
                                        },
                                        timestamp: new Date(),
                                        thumbnail: {
                                            url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                        }
                                    }});
                                });
                            }).catch(function(err){
                                console.log(chalk.red('Проблема с заданнымрангом: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
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
                            description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `К сожалению! ${username} не существует в базе данных пользователей Roblox. Возможно, вы ошиблись?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Пожалуйста, укажите целевое имя пользователя.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "содействовать") {
        if(!message.member.roles.some(r=>["Рейтинг разрешений"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "Вам нужно `Рейтинг разрешений` роль для запуска этой команды.",
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
                                description: "Этот бот не может повысить этот ранг.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.promote(config.groupId, id)
                            .then(function(newRole){
                                getRankName(config.groupId, id)
                                .then(function(rolename){
                                    getRankID(config.groupId, id)
                                    .then(function(roleid){
                                        message.channel.send({embed: {
                                            color: 8117429,
                                            description: `Вы успешно продвинулись ${username} в ${rolename} (${roleid})!`,
                                            author: {
                                                name: message.author.tag,
                                                icon_url: message.author.displayAvatarURL
                                            }
                                        }});
                                    })
                                });
                                if(config.logchannelid === 'ложный') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> способствовал ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Журналы действий'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Проблема с продвижением: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
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
                            description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `К сожалению! ${username} не существует в базе данных пользователей Roblox. Возможно, вы ошиблись?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Пожалуйста, укажите целевое имя пользователя.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "Понизить") {
        if(!message.member.roles.some(r=>["Рейтинг разрешений"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "Вам нужно `Рейтинг разрешений` роль для запуска этой команды.",
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
                                description: "Этот бот не может быть ранжирован этим ботом.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.demote(config.groupId, id)
                            .then(function(newRole){
                                getRankName(config.groupId, id)
                                .then(function(rolename){
                                    getRankID(config.groupId, id)
                                    .then(function(roleid){
                                        message.channel.send({embed: {
                                            color: 8117429,
                                            description: `Вы успешно понижены в должности ${username} в ${rolename} (${roleid})!`,
                                            author: {
                                                name: message.author.tag,
                                                icon_url: message.author.displayAvatarURL
                                            }
                                        }});
                                    })
                                });
                                if(config.logchannelid === 'ложный') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> понижен в должности ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Журналы действий'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Проблема с демот: ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
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
                            description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `К сожалению! ${username} не существует в базе данных пользователей Roblox. Возможно, вы ошиблись?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Пожалуйста, укажите целевое имя пользователя.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === "fire") {
        if(!message.member.roles.some(r=>["Ранжирование разрешений"].includes(r.name)) )
            return message.channel.send({embed: {
                color: 15406156,
                description: "Для запуска этой команды вам нужна роль 'Ранжирование разрешений'.",
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
                                description: "Этот бот не может быть ранжирован этим ботом.",
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL
                                }
                            }});
                        } else {
                            rbx.setRank(config.groupId, id, 1)
                            .then(function(newRole){
                                getRankName(config.groupId, id)
                                .then(function(rolename){
                                    getRankID(config.groupId, id)
                                    .then(function(roleid){
                                        message.channel.send({embed: {
                                            color: 8117429,
                                            description: `Вы успешно уволены ${username}.`,
                                            author: {
                                                name: message.author.tag,
                                                icon_url: message.author.displayAvatarURL
                                            }
                                        }});
                                    })
                                });
                                if(config.logchannelid === 'false') return;
                                var logchannel = message.guild.channels.get(config.logchannelid);
                                logchannel.send({embed: {
                                    color: 11253955,
                                    description: `<@${message.author.id}> уволил ${username}.`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL
                                    },
                                    footer: {
                                        text: 'Журналы действий'
                                    },
                                    timestamp: new Date(),
                                    thumbnail: {
                                        url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${username}`
                                    }
                                }});
                            }).catch(function(err){
                                console.log(chalk.red('Проблема с установитьранг (огонь): ' + err));
                                message.channel.send({embed: {
                                    color: 15406156, 
                                    description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
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
                            description: "К сожалению! Что-то пошло не так. Проблема была зарегистрирована в консоли бота.",
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL
                            }
                        }});
                    });
                }).catch(function(err){
                    message.channel.send({embed: {
                        color: 15406156,
                        description: `К сожалению ${username} не существует в пользовательской базе данных Roblox. Возможно, вы ошиблись?`,
                        author: {
                            name: message.author.tag,
                            icon_url: message.author.displayAvatarURL
                        }
                    }});
                });
            } else {
                message.channel.send({embed: {
                    color: 15406156,
                    description: "Пожалуйста, укажите целевое имя пользователя.",
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL
                    }
                }});
            }
            return;
    }

    if(command === 'окрик'){
        if(!message.member.roles.some(r=>["Ранжирование разрешений", "Разрешения крика"].includes(r.name)) )
        return message.channel.send({embed: {
            color: 15406156,
            description: "Для запуска этой команды вам нужна роль 'Ранжирование разрешений' или 'Разрешения крика'.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
        var msg = args.slice(0).join(" ");
        if(!msg){
            return message.channel.send({embed: {
                color: 15406156,
                description: `Пожалуйста, укажите сообщение. Если вы пытаетесь убрать крик, пожалуйста, используйте \`${config.prefix}вместо этого команда clearshout \`,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL
                }
            }});
        }
    rbx.shout(config.groupId, msg).catch(console.error);
    message.channel.send({embed: {
        color: 8117429,
        description: `Успешно отправлен крик.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        }
    }});
    if(config.logchannelid === 'false') return;
    var logchannel = message.guild.channels.get(config.logchannelid);
    logchannel.send({embed: {
        color: 11253955,
        description: `<@${message.author.id}> обновил групповой крик.\nMessage: ${msg}`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        },
        footer: {
            text: 'Журналы действий'
        },
        timestamp: new Date()
    }});
    }

    if(command === 'чистый крик'){
        if(!message.member.roles.some(r=>["Ранжирование разрешений", "Разрешения крика"].includes(r.name)) )
        return message.channel.send({embed: {
            color: 15406156,
            description: "Для запуска этой команды вам нужна роль 'Ранжирование разрешений' или 'Разрешения крика'.",
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL
            }
        }});
    rbx.shout(config.groupId, "").catch(console.error);
    message.channel.send({embed: {
        color: 8117429,
        description: `Успешно очищенный крик.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        }
    }});
    if(config.logchannelid === 'ложный') return;
    var logchannel = message.guild.channels.get(config.logchannelid);
    logchannel.send({embed: {
        color: 11253955,
        description: `<@${message.author.id}> очистил групповой крик.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL
        },
        footer: {
            text: 'Журналы действий'
        },
        timestamp: new Date()
    }});
    }

    if(command === 'currentshout'){
        rbx.getShout(config.groupId).then(shout => {
           message.channel.send({embed: {
               color: 11253955,
               description: `**Сообщение от ${shout.poster.username}**\n${shout.body}`,
               author: {
                   name: message.author.tag,
                   icon_url: message.author.displayAvatarURL
               },
               thumbnail: {
                   url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${shout.poster.username}`
               }
           }});
        });
    }
    
// Start of extra commands.



// End of commands.
});

client.login(config.token);
