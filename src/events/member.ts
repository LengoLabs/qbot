import { TextChannel } from 'discord.js';
import { Group as RobloxGroup } from "bloxy/dist/structures";
import { GroupConfig } from '../structures/types';
import { discordClient } from '../main';
import {
    getMemberCountMessage,
    getMemberCountMilestoneEmbed,
} from '../handlers/locale';

let firstRecord = true;
let lastRemainder: number;
let lastMemberCount: number;

const recordMemberCount = async (robloxGroup: RobloxGroup, groupConfig: GroupConfig) => {
    setTimeout(recordMemberCount, 60 * 1000);

    try {
        if (!firstRecord) {
            const memberCountChannel = await discordClient.channels.cache.get(groupConfig.memberCount.channelId) as TextChannel;

            if (robloxGroup.memberCount === lastMemberCount) return;

            if (groupConfig.memberCount.milestone) {
                const currentRemainder = robloxGroup.memberCount % groupConfig.memberCount.milestone;
                if (lastMemberCount < robloxGroup.memberCount && (currentRemainder === 0 || lastRemainder > currentRemainder)) {
                    memberCountChannel.send({ embeds: [getMemberCountMilestoneEmbed(robloxGroup.memberCount)] });
                } else {
                    if (!groupConfig.memberCount.onlyMilestones) memberCountChannel.send({ content: getMemberCountMessage(lastMemberCount, robloxGroup.memberCount) });
                }

                lastRemainder = currentRemainder;
            } else {
                memberCountChannel.send({ content: getMemberCountMessage(lastMemberCount, robloxGroup.memberCount) });
            }

            lastMemberCount = robloxGroup.memberCount;
        } else {
            lastMemberCount = robloxGroup.memberCount;
            if (groupConfig.memberCount.milestone) lastRemainder = robloxGroup.memberCount % groupConfig.memberCount.milestone;
            firstRecord = false;
        }
    } catch (err) {
        console.error(err);
    }
}

export { recordMemberCount };
