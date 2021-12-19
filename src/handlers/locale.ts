import { MessageEmbed } from 'discord.js';
import { CommandArgument } from '../structures/types';
import { config } from '../config';
import { User, PartialUser } from 'bloxy/dist/structures';
import { robloxGroup } from '../main';
const cdnDomain = '';

export const checkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/check.png';
export const xmarkIconUrl = 'https://cdn.lengolabs.com/qbot-icons/xmark.png';

export const greenColor = '#50C790';
export const redColor = '#FA5757';

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
        .setDescription(`**${user.name}** has been promoted to **${newRole}**!`);

    return embed;
}

export const getSuccessfulDemotionEmbed = async (user: User | PartialUser, newRole: string): Promise<MessageEmbed> => {
    const groupRoles = await robloxGroup.getRoles();
    const embed = new MessageEmbed()
        .setAuthor('Success!', checkIconUrl)
        .setColor(greenColor)
        .setDescription(`**${user.name}** has been demoted to **${newRole}**!`);

    return embed;
}

export const getSuccessfulFireEmbed = async (user: User | PartialUser, newRole: string): Promise<MessageEmbed> => {
    const groupRoles = await robloxGroup.getRoles();
    const embed = new MessageEmbed()
        .setAuthor('Success!', checkIconUrl)
        .setColor(greenColor)
        .setDescription(`**${user.name}** has been fired to **${newRole}**!`);

    return embed;
}

export const getUnexpectedErrorEmbed = (): MessageEmbed => {
    const embed = new MessageEmbed()
        .setAuthor('Unexpected Error', xmarkIconUrl)
        .setColor(redColor)
        .setDescription('Unfortunately, something that we did not expect went wrong while processing this action. More information has been logged for the bot owner to diagnose.');

    return embed;
}