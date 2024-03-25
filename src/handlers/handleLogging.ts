import { TextChannel, User as DiscordUser } from 'discord.js';
import { GroupMember, PartialUser, User as RobloxUser, Group as RobloxGroup } from 'bloxy/dist/structures';
import { discordClient } from '../main';
import { getLogEmbed } from './locale';
import { config } from '../config';
import { recordAction } from './abuseDetection';

let actionLogChannel: TextChannel;
const getLogChannels = async () => {
    if (config.logChannels.actions) {
        actionLogChannel = await discordClient.channels.fetch(config.logChannels.actions) as TextChannel;
    }
}

const logAction = async (robloxGroup: RobloxGroup|boolean, action: string, moderator: DiscordUser | RobloxUser | GroupMember | any, reason?: string, target?: RobloxUser | PartialUser, rankChange?: string, endDate?: Date, body?: string, xpChange?: string) => {
    if (moderator.id !== discordClient.user.id) recordAction(robloxGroup, moderator);
    if (!actionLogChannel) return;
    actionLogChannel.send({ embeds: [await getLogEmbed(robloxGroup, action, moderator, reason, target, rankChange, endDate, body, xpChange)] });
}

export { logAction, getLogChannels };