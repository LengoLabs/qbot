import { TextChannel } from 'discord.js';
import { config } from '../config';
import { discordClient, robloxClient, robloxGroup } from '../main';
import {
    getMemberCountMessage,
    getMemberCountMilestoneEmbed,
} from '../handlers/locale';

let firstRecord = true;
let lastRemainder: number;
let lastMemberCount: number;

const recordMemberCount = async () => {
    setTimeout(recordMemberCount, 60 * 1000);
    try {
        if(!firstRecord) {
            const group = await robloxClient.getGroup(config.groupId);
            const memberCountChannel = await discordClient.channels.cache.get(config.memberCount.channelId) as TextChannel;
            if(group.memberCount === lastMemberCount) return;
    
            if(config.memberCount.milestone) {
                const currentRemainder = group.memberCount % config.memberCount.milestone;
                if (lastMemberCount < group.memberCount && (currentRemainder === 0 || lastRemainder > currentRemainder)) {
                    memberCountChannel.send({ embeds: [ getMemberCountMilestoneEmbed(group.memberCount) ] });
                } else {
                    if (!config.memberCount.onlyMilestones) {
                        memberCountChannel.send({ content: getMemberCountMessage(lastMemberCount, group.memberCount) });
                    }
                }
                
                lastRemainder = currentRemainder;
            } else {
                memberCountChannel.send({ content: getMemberCountMessage(lastMemberCount, group.memberCount) });
            }
    
            lastMemberCount = group.memberCount;
        } else {
            const group = await robloxClient.getGroup(config.groupId);
            lastMemberCount = group.memberCount;
            if(config.memberCount.milestone) lastRemainder = group.memberCount % config.memberCount.milestone;
            firstRecord = false;
        }
    } catch (err) {
        console.error(err);
    }
}

export { recordMemberCount };
