require('dotenv').config();
exports.run = async (client, message, args) => {
    return message.channel.send({embed: {
        color: 7948427,
        description: `**Here are my commands:**\n`
        + `\`${process.env.prefix}help\` - Shows this list of commands.\n`
        + `\`${process.env.prefix}setrank <user> <rank name/number>\` - Ranks the user in the Roblox group to the specified rank number or name.\n`
        + `\`${process.env.prefix}promote <user>\` - Moves the user 1 rank up in the Roblox group.\n`
        + `\`${process.env.prefix}demote <user>\` - Moves the user 1 rank down in the Roblox group.\n`
        + `\`${process.env.prefix}fire <user>\` - Moves a user to the lowest rank possible besides Guest.\n`
        + `\`${process.env.prefix}shout <message>\` - Posts a group shout.\n`
        + `\`${process.env.prefix}clearshout\` - Clears the group shout.\n`
        + `\`${process.env.prefix}currentshout\` - Shows the current group shout.\n`
        + `\`${process.env.prefix}accept-join <user>\` - Accepts a user's join request.\n`
        + `\`${process.env.prefix}deny-join <user>\` - Denies a user's join request.`,
        author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL()
        }
    }});
}
