// These are just extra commands that I have that people have suggested. This uses the same qbot layout, so all you gotta do is paste this below the last command
// Ban command
    if (command === "ban") {
        if (!args[0]) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "Please input a user.",
            }});
        }
        let bUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
        if (!bUser) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "I'm sorry, but I can't find that user.",
            }});
        }

        let bReason = args.join(" ").slice(22)
        if (!message.member.hasPermission("BAN_MEMBERS")) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "I'm sorry, but you don't have the appropriate permissions to run this command!",
            }}); 
        }

        let banEmbed = new Discord.RichEmbed()
        .setDescription("Ban")
        .setColor("#e56b00")
        .addField("Banned user", `${bUser} with the ID of ${bUser.id}`)
        .addField("Banned by", `<@${message.author.id}> with the ID of ${message.author.id}`)
        .addField("Reason", bReason)
        var runner = message.author.id
        message.guild.member(bUser).send(`You have been banned by <@${runner}> for the reason of ${bReason}.`)
        message.guild.member(bUser).ban(bReason);
        message.channel.send(banEmbed);
    }
    
    // Kick command
        if (command === "kick") {
        if (!args[0]) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "Please input a user.",
            }});
        }
        let kUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!kUser) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "I'm sorry, but I can't find that user.",
            }});
        }
        let kReason = args.join(" ").slice(22)
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            return message.channel.send({embed: {
                color: 15406156,
                description: "I'm sorry, but you don't have the appropriate permissions to run this command!",
            }}); 
        }
        
        let kickEmbed = new Discord.RichEmbed()
        .setDescription("Kick")
        .setColor("#e56b00")
        .addField("Kicked user", `${kUser} with the ID of ${kUser.id}`)
        .addField("Kicked by", `<@${message.author.id}> with the ID of ${message.author.id}`)
        .addField("Reason", kReason)
        var runner = message.author.id
        message.guild.member(kUser).send(`You have been kicked by <@${runner}> for the reason of ${kReason}.`)
        message.guild.member(kUser).kick(kReason);
        message.channel.send(kickEmbed);
    }
