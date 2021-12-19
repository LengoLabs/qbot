import { MessageEmbed } from 'discord.js';
import { CommandArgument } from '../structures/types';
import { config } from '../config';
import { User, PartialUser } from 'bloxy/dist/structures';
import { robloxGroup } from '../main';
import { textSync } from 'figlet';
const cdnDomain = '';

export const checkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/check.png';
export const xmarkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/xmark.png';

export const greenColor = '#50C790';
export const redColor = '#FA5757';

export const consoleMagenta = '\x1b[35m';
export const consoleGreen = '\x1b[32m';
export const consoleYellow = '\x1b[33m';
export const consoleRed = '\x1b[31m';
export const consoleClear = '\x1b[0m';

export const qbotLaunchTextDisplay = `${consoleMagenta}${textSync('Qbot')}`;
export const welcomeText = `${consoleYellow}Hey, thanks for using Qbot! If you run into any issues, please do not hesitate to join our support server: https://discord.gg/ezxP5BJuDb`;
export const startedText = `\n${consoleGreen}✓  ${consoleClear}Your bot has been started.`;
export const securityText = `\n${consoleRed}⚠  ${consoleClear}URGENT: For security reasons, public bot must be DISABLED for the bot to start. For more information, please refer to this section of our documentation: https://docs.lengolabs.com/qbot/setup/replit-guide#discord`;

export const noFiredRankLog = `${consoleRed}Uh oh, you do not have a fired rank with the rank specified in your configuration file.`;

export const getMissingArgumentsEmbed = (cmdName: string, args: CommandArgument[]): MessageEmbed => {
    let argString = '';
    args.forEach((arg) => {
        argString += arg.required || true ? `<${arg.trigger}> ` : `[${arg.trigger}] `;
    });
    argString = argString.substring(0, argString.length - 1);

    const embed = new MessageEmbed()
        .setAuthor('Invalid Usage', xmarkIconUrl)
        .setColor(redColor)
        .setDescription(`Command Usage: \`${config.legacyCommands.prefixes[0]}${cmdName} ${argString}\``)
        .setFooter(config.slashCommands ? 'Tip: Slash commands automatically display the required arguments for commands.' : '');
    
    return embed;
}

export const getInvalidRobloxUserEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Query Unsuccessful', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('The Roblox user you searched for does not exist.');

    return embed;
}

export const getRobloxUserIsNotMemberEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Unable to Rank', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('The Roblox user you searched for is not a member of the Roblox group.');

    return embed;
}

export const getSuccessfulPromotionEmbed = async (user: User | PartialUser, newRole: string): Promise<MessageEmbed> => {
    const groupRoles = await robloxGroup.getRoles();
    const embed = new MessageEmbed()
        .setAuthor('Success!', checkIconUrl)
        .setColor(greenColor)
        .setThumbnail((await user.getAvatarHeadShotImage({ format: 'png', size: '48x48', isCircular: false })).imageUrl)
        .setDescription(`**${user.name}** has been successfully promoted to **${newRole}**!`);

    return embed;
}

export const getSuccessfulDemotionEmbed = async (user: User | PartialUser, newRole: string): Promise<MessageEmbed> => {
    const groupRoles = await robloxGroup.getRoles();
    const embed = new MessageEmbed()
        .setAuthor('Success!', checkIconUrl)
        .setColor(greenColor)
        .setThumbnail((await user.getAvatarHeadShotImage({ format: 'png', size: '48x48', isCircular: false })).imageUrl)
        .setDescription(`**${user.name}** has been successfully demoted to **${newRole}**.`);

    return embed;
}

export const getSuccessfulFireEmbed = async (user: User | PartialUser, newRole: string): Promise<MessageEmbed> => {
    const groupRoles = await robloxGroup.getRoles();
    const embed = new MessageEmbed()
        .setAuthor('Success!', checkIconUrl)
        .setColor(greenColor)
        .setThumbnail((await user.getAvatarHeadShotImage({ format: 'png', size: '48x48', isCircular: false })).imageUrl)
        .setDescription(`**${user.name}** has been successfully fired, and now has the **${newRole}** role.`);

    return embed;
}

export const getUnexpectedErrorEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Unexpected Error', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('Unfortunately, something that we did not expect went wrong while processing this action. More information has been logged for the bot owner to diagnose.');

    return embed;
}

export const getNoRankAboveEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Cannot Promote', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('There is no rank directly above this user, so you are unable to promote them.');

    return embed;
}

export const getNoRankBelowEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Cannot Demote', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('There is no rank directly below this user, so you are unable to demote them.');

    return embed;
}

export const getNoPermissionEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Unauthorized', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('You do not have permission to run this command.');

    return embed;
}

export const getVerificationChecksFailedEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Verification Check Failed', xmarkIconUrl)
        .setColor(redColor)
        .setDescription(`
        To prevent you from ranking someone that you would not manually be able to rank, we check the following things before allowing you to rank a user. In this case, you have failed one or more, and therefore you are unable to rank this user.

        • You are verified on this server.
        • The user you are performing this action on is not you.
        • Your rank is above the rank of the user you are trying to perform this action on.
        `);

    return embed;
}