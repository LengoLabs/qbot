import { TextChannel, User as DiscordUser } from 'discord.js';
import { PartialUser, User as RobloxUser } from 'bloxy/dist/structures';
import { discordClient } from '../main';
import { getLogEmbed } from './locale';
import { config } from '../config';

let actionLogChannel: TextChannel;
(async () => {
    if(config.logChannels.actions) {
        actionLogChannel = await discordClient.channels.fetch(config.logChannels.actions) as TextChannel;
    }
})();

const logAction = async (action: string, moderator: DiscordUser, reason?: string, target?: RobloxUser | PartialUser, rankChange?: string, endDate?: Date, body?: string) => {
    if(!actionLogChannel) return;
    actionLogChannel.send({ embeds: [ await getLogEmbed(action, moderator, reason, target, rankChange, endDate, body) ] });
}

export { logAction };