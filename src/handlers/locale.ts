import { EmbedBuilder } from 'discord.js';
import { CommandArgument, DatabaseUser } from '../structures/types';
import { config } from '../config';
import { User, PartialUser, GroupMember, GroupJoinRequest, GroupRole, Group as RobloxGroup } from 'bloxy/dist/structures';
import { User as DiscordUser } from 'discord.js';
import { Command } from '../structures/Command';
import { robloxClient } from '../main';
import { textSync } from 'figlet';

export const checkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/check.png';
export const xmarkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/xmark.png';
export const infoIconUrl = 'https://cdn.lengolabs.com/qbot-icons/info.png';
export const quoteIconUrl = 'https://cdn.lengolabs.com/qbot-icons/quote.png';

export const mainColor = '#906FED';
export const greenColor = '#50C790';
export const redColor = '#FA5757';

export const consoleMagenta = '\x1b[35m';
export const consoleGreen = '\x1b[32m';
export const consoleYellow = '\x1b[33m';
export const consoleRed = '\x1b[31m';
export const consoleClear = '\x1b[0m';

export const qbotLaunchTextDisplay = `${consoleMagenta}${textSync('Qbot')}`;
export const welcomeText = `${consoleYellow}Hey, thanks for using Qbot! If you run into any issues, please do not hesitate to join our support server: https://lengolabs.com/discord`;
export const startedText = `\n${consoleGreen}✓  ${consoleClear}Your bot has been started.`;
export const securityText = `\n${consoleRed}⚠  ${consoleClear}URGENT: For security reasons, public bot must be DISABLED for the bot to start. For more information, please refer to this section of our documentation: https://docs.lengolabs.com/qbot/setup/replit-guide#discord`;

export const noFiredRankLog = `Uh oh, you do not have a fired rank with the rank specified in your configuration file.`;
export const noSuspendedRankLog = `Uh oh, you do not have a suspended rank with the rank specified in your configuration file.`;
export const getListeningText = (port) => `${consoleGreen}✓  ${consoleClear}Listening on port ${port}.`;

const getHeadshotImage = async (userId: number) => {
    return (await robloxClient.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({ userIds: [userId], size: '48x48', format: 'png' })).data[0];
}

export const getUnknownCommandMessage = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command Unavailable', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This command is not available here, or there was an unexpected error finding it on our system.');

    return embed;
}

export const getMissingArgumentsEmbed = (cmdName: string, args: CommandArgument[]): EmbedBuilder => {
    let argString = '';
    args.forEach((arg) => {
        if (arg.isLegacyFlag) {
            argString += arg.required || true ? `--<${arg.trigger}> ` : `--[${arg.trigger}] `;
        } else {
            argString += arg.required || true ? `<${arg.trigger}> ` : `[${arg.trigger}] `;
        }
    });
    argString = argString.substring(0, argString.length - 1);

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Invalid Usage', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription(`Command Usage: \`${config.legacyCommands.prefixes[0]}${cmdName} ${argString}\``)
        .setFooter({ text: config.slashCommands ? 'Tip: Slash commands automatically display the required arguments for commands.' : '' });

    return embed;
}

export const getInvalidRobloxUserEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Query Unsuccessful', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('The Roblox user you searched for does not exist.');

    return embed;
}

export const getNoDatabaseEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command Disabled', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This command requires the database to be setup, and one has not been set up for this bot.');

    return embed;
}

export const getRobloxUserIsNotMemberEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Unable to Rank', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('The Roblox user you searched for is not a member of the Roblox group.');

    return embed;
}

export const getNoJoinRequestEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'No Join Request', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user does not have a pending join request to review.');

    return embed;
}

export const getSuccessfulAddingAndRankupEmbed = async (user: User | PartialUser, newRole: string, xpChange: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been given **${xpChange}** XP and has been promoted to **${newRole}**, becuase they had enough XP!`)

    return embed
}

export const getSuccessfulPromotionEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully promoted to **${newRole}**!`);

    return embed;
}

export const getSuccessfulDemotionEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully demoted to **${newRole}**.`);

    return embed;
}

export const getSuccessfulFireEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully fired, and now has the **${newRole}** role.`);

    return embed;
}

export const getSuccessfulExileEmbed = async (user: User | PartialUser): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully exiled from the group.`);

    return embed;
}

export const getSuccessfulSetRankEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has successfully been ranked to the **${newRole}** role.`);

    return embed;
}

export const getSuccessfulShoutEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription('The group shout has been updated to that message!');

    return embed;
}

export const getSuccessfulSignalEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription('The specified command has been stored and made available to connected Roblox games using our API.');

    return embed;
}

export const getSuccessfulRevertRanksEmbed = (actionCount: number): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`Successfully started reverting back **${actionCount}** ranking actions.`);

    return embed;
}

export const getSuccessfulXPRankupEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully ranked to **${newRole}**!`);

    return embed;
}

export const getSuccessfulXPChangeEmbed = async (user: User | PartialUser, xp: number): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`The XP of **${user.name}** has been updated, they now have a total of **${xp}** XP.`);

    return embed;
}

export const getSuccessfulSuspendEmbed = async (user: User | PartialUser, newRole: string, endDate: Date): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** has been successfully suspended, and will have their rank returned in <t:${Math.round(endDate.getTime() / 1000)}:R>.`);

    return embed;
}

export const getSuccessfulUnsuspendEmbed = async (user: User | PartialUser, newRole: string): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`**${user.name}** is no longer suspended, and has been ranked back to **${newRole}**!`);

    return embed;
}

export const getSuccessfulAcceptJoinRequestEmbed = async (user: User | PartialUser): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`The join request from **${user.name}** has been accepted.`);

    return embed;
}

export const getSuccessfulDenyJoinRequestEmbed = async (user: User | PartialUser): Promise<EmbedBuilder> => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setDescription(`The join request from **${user.name}** has been denied.`);

    return embed;
}

export const getUserSuspendedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Is Suspended', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user is suspended, and cannot be ranked. Please use the unsuspend command to revert this.');

    return embed;
}

export const getUserBannedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Is Banned', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user is already banned.');

    return embed;
}

export const getUserNotBannedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Not Banned', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user is not banned, so it is impossible to unban them.');

    return embed;
}

export const getCommandNotFoundEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command Not Found', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('A command could not be found with that query.');

    return embed;
}

export const getAlreadySuspendedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Already Suspended', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user is already suspended. Please use the unsuspend command to revert this.');

    return embed;
}

export const getUnexpectedErrorEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Unexpected Error', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('Unfortunately, something that we did not expect went wrong while processing this action. More information has been logged for the bot owner to diagnose.');

    return embed;
}

export const getNoRankAboveEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Cannot Promote', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('There is no rank directly above this user, so you are unable to promote them.');

    return embed;
}

export const getNoRankBelowEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Cannot Demote', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('There is no rank directly below this user, so you are unable to demote them.');

    return embed;
}

export const getNoPermissionEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Unauthorized', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('You do not have permission to use this command.');

    return embed;
}

export const getInvalidXPEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Invalid XP', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('The value of XP used in this command must be a positive integer.');

    return embed;
}

export const getNoRankupAvailableEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'No Rankup Available', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('You do not have any available rankups.');

    return embed;
}

export const getVerificationChecksFailedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Verification Check Failed', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription(`
        To prevent you from ranking someone that you would not manually be able to rank, the bot checks the following things before allowing you to rank a user. In this case, you have failed one or more, and therefore you are unable to rank this user.

        • You are verified on this server.
        • The user you are performing this action on is not you.
        • Your rank is above the rank of the user you are trying to perform this action on.
        `);

    return embed;
}

export const getAlreadyFiredEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Already Fired', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user already has the fired rank.');

    return embed;
}

export const getRoleNotFoundEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Role Unavailable', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user you have specified does not exist on the group, or cannot be ranked by this bot.');

    return embed;
}

export const getInvalidDurationEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Invalid Duration', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('Durations must be within 5 minutes and 2 years.');

    return embed;
}

export const getShoutLogEmbed = async (shout: any): Promise<EmbedBuilder> => {
    const shoutCreator = await robloxClient.apis.usersAPI.getUserById(shout.creator.id);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Shout from ${shoutCreator.name}`, iconURL: quoteIconUrl })
        .setThumbnail((await getHeadshotImage(shout.creator.id)).imageUrl)
        .setColor(mainColor)
        .setTimestamp()
        .setDescription(shout.content);

    return embed;
}

export const getWallPostEmbed = async (post): Promise<EmbedBuilder> => {
    const postCreator = await robloxClient.apis.usersAPI.getUserById(post.poster);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Posted by ${postCreator.name}`, iconURL: quoteIconUrl })
        .setThumbnail((await getHeadshotImage(post.poster)).imageUrl)
        .setColor(mainColor)
        .setTimestamp()
        .setDescription(post['body']);

    return embed;
}

export const getLogEmbed = async (robloxGroup: RobloxGroup|boolean, action: string, moderator: DiscordUser | User | GroupMember | any, reason?: string, target?: User | PartialUser, rankChange?: string, endDate?: Date, body?: string, xpChange?: string): Promise<EmbedBuilder> => {
    if (target && !target.name) target = null;

    const embed = new EmbedBuilder()
        .setColor(mainColor)
        .setTimestamp()
        .setDescription(`**Action:** ${action}\n${target ? `**Target:** ${target.name} (${target.id})\n` : ''}${rankChange ? `**Rank Change:** ${rankChange}\n` : ''}${xpChange ? `**XP Change:** ${xpChange}\n` : ''}${endDate ? `**Duration:** <t:${Math.round(endDate.getTime() / 1000)}:R>\n` : ''}${typeof robloxGroup === "boolean" ? '' : `**Group:** ${robloxGroup.name}\n`}${reason ? `**Reason:** ${reason}\n` : ''}${body ? `**Body:** ${body}\n` : ''}`);

    if (typeof moderator === 'string') {
        embed.setAuthor({ name: moderator });
    } else {
        if (moderator instanceof DiscordUser) {
            embed.setAuthor({ name: moderator.username, iconURL: moderator.displayAvatarURL() });
            embed.setFooter({ text: `Moderator ID: ${moderator.id}` });
        } else {
            embed.setAuthor({ name: moderator.username });
            embed.setThumbnail((await getHeadshotImage(target.id)).imageUrl)
        }
    }

    return embed;
}

export const getXPSysDisabledEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'XP System disabled', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('The group config has the XP system disabled for this group.');

    return embed;
}

export const getAlreadyRankedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Already Ranked', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user already has this rank.');

    return embed;
}

export const getPartialUserInfoEmbed = async (user: User | PartialUser, data: DatabaseUser): Promise<EmbedBuilder> => {
    const primaryGroup = await user.getPrimaryGroup();
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Information: ${user.name}`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(primaryGroup ? `Primary Group: [${primaryGroup.group.name}](https://roblox.com/groups/${primaryGroup.group.id})` : null)
        .setThumbnail((await getHeadshotImage(user.id)).imageUrl)
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp()
        .addFields([
            {
                name: 'Role',
                value: 'Guest (0)',
                inline: true
            },
            {
                name: 'Banned',
                value: data.isBanned ? `✅` : '❌',
                inline: true
            }
        ]);

    return embed;
}

export const getUserInfoEmbed = async (user: User | PartialUser, member: GroupMember, data: DatabaseUser): Promise<EmbedBuilder> => {
    const primaryGroup = await user.getPrimaryGroup();
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Information: ${user.name}`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(primaryGroup ? `Primary Group: [${primaryGroup.group.name}](https://roblox.com/groups/${primaryGroup.group.id})` : null)
        .setThumbnail((await robloxClient.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({ userIds: [user.id], size: '150x150', format: 'png', isCircular: false })).data[0].imageUrl)
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp()
        .addFields([
            {
                name: 'Role',
                value: `${member.role.name} (${member.role.rank})`,
                inline: true
            },
            {
                name: 'Banned',
                value: data.isBanned ? `✅` : '❌',
                inline: true
            }
        ]);

        /*
        TODO: ADD
            {
                name: 'XP',
                value: data.xp.toString() || '0',
                inline: true
            },
            {
                name: 'Suspended',
                value: data.suspendedUntil ? `✅ (<t:${Math.round(data.suspendedUntil.getTime() / 1000)}:R>)` : '❌',
                inline: true
            },
            */
    return embed;
}

export const getRoleListEmbed = async (robloxGroup: RobloxGroup): Promise<EmbedBuilder> => {
    const roles = await robloxGroup.getRoles();

    const embed = new EmbedBuilder()
        .setAuthor({ name: robloxGroup.name + "'s Group Roles", iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription('Here is a list of all roles on the group.');

    roles.forEach((role) => {
        embed.addFields({
            name: role.name,
            value: `Rank: \`${role.rank || '0'}\``,
            inline: true
        });
    });

    return embed;
}

export const getNotSuspendedEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'User Not Suspended', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('This user is not suspended, meaning you cannot run this command on them.');

    return embed;
}

export const getMemberCountMessage = (oldCount: number, newCount: number): string => {
    if (newCount > oldCount) {
        return `⬆️ The member count is now **${newCount}** (+${newCount - oldCount})`;
    } else {
        return `⬇️ The member count is now **${newCount}** (-${oldCount - newCount})`;
    }
}

export const getMemberCountMilestoneEmbed = (count: number): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Member Milestone Reached!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`🎉 The member count is now **${count}**!`);

    return embed;
}

export const getCommandInfoEmbed = (command: Command): EmbedBuilder => {
    let argString = '';
    command.args.forEach((arg) => {
        argString += arg.required || true ? `<${arg.trigger}> ` : `[${arg.trigger}] `;
    });
    argString = argString.substring(0, argString.length - 1);

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command Information', iconURL: infoIconUrl })
        .setTitle(command.trigger)
        .setColor(mainColor)
        .setDescription(command.description)
        .setFooter({ text: config.slashCommands ? 'Tip: Slash commands automatically display a list of available commands, and their required usage.' : '' })
        .setFields([
            {
                name: 'Module',
                value: command.module,
                inline: true
            },
            {
                name: 'Usage',
                value: `\`${argString}\``,
                inline: true
            }
        ]);

    return embed;
}

export const getCommandListEmbed = (modules: { [key: string]: Command[] }): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command List', iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(config.slashCommands && config.legacyCommands ? 'Tip: Slash commands automatically display a list of available commands, and their required usage.' : null);

    Object.keys(modules).forEach((key) => {
        const moduleCommands = modules[key];
        const mappedCommands = moduleCommands.map((cmd) => `\`${cmd.trigger}\` - ${cmd.description}`);
        embed.addFields({
            name: key.replace('-', ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            value: mappedCommands.join('\n'),
        });
    });

    return embed;
}

export const getJoinRequestsEmbed = (joinRequests: GroupJoinRequest[]): EmbedBuilder => {
    const requestString = joinRequests.map((request) => `- \`${request['requester'].username}\``).join('\n');
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Join Requests', iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`${joinRequests.length !== 0 ? `There is currently ${joinRequests.length} pending join requests:\n\n${requestString}` : 'There are currently no pending join requests.'}`);

    return embed;
}

export const getSuccessfulGroupBanEmbed = (user: User | PartialUser): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`**${user.name}** has successfully been banned from the group.`);

    return embed;
}

export const getSuccessfulGroupUnbanEmbed = (user: User | PartialUser): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`**${user.name}** has successfully been unbanned from the group.`);

    return embed;
}

export const getInvalidRobloxGroupEmbed = (): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Invalid Group', iconURL: xmarkIconUrl })
        .setColor(redColor)
        .setDescription('The secondary group you provided for this action is not setup.');

    return embed;
}