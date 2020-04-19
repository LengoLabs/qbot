exports.run = async (client, message, args) => {
    return message.channel.send({embed: {
        color: 7948427,
        description: `**Here are my commands:**\n`
        + `\`${client.config.prefix}help\` - Shows this list of commands.\n`
        + `\`${client.config.prefix}setrank <user> <rank name/number>\` - Ranks the user in the Roblox group to the specified rank number or name.\n`
        + `\`${client.config.prefix}promote <user>\` - Moves the user 1 rank up in the Roblox group.\n`
        + `\`${client.config.prefix}demote <user>\` - Moves the user 1 rank down in the Roblox group.\n`
        + `\`${client.config.prefix}fire <user>\` - Moves a user to the lowest rank possible besides Guest.\n`
        + `\`${client.config.prefix}shout <message>\` - Posts a group shout.\n`
        + `\`${client.config.prefix}clearshout\` - Clears the group shout.\n`
        + `\`${client.config.prefix}currentshout\` - Shows the current group shout.\n`
        + `\`${client.config.prefix}accept-join <user>\` - Accepts a user's join request.\n`
        + `\`${client.config.prefix}deny-join <user>\` - Denies a user's join request.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL()
        }
    }});
}
