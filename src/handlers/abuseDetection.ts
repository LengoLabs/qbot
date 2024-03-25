import { User } from 'discord.js';
import { config, findGroupById } from '../config';
import { discordClient } from '../main';
import { getLinkedRobloxUser } from './accountLinks';
import { logAction } from './handleLogging';

let actionCounts = [];

const recordAction = async (robloxGroup, moderator: User) => {
    if(!config.antiAbuse.enabled) return;

    if(actionCounts[moderator.id]) {
        actionCounts[moderator.id] += 1;
    } else {
        actionCounts[moderator.id] = 1;
    }

    if(actionCounts[moderator.id] >= config.antiAbuse.threshold) {
        try {
            const linkedUser = await getLinkedRobloxUser(moderator.id);
            if(!linkedUser) return;

            let groupConfig;

            try {
                groupConfig = await findGroupById(robloxGroup.id);
            } catch (error) {
                return console.error("Failed to recordAction, cannot find group config.");
            }

            const groupRoles = await robloxGroup.getRoles();
            const demotionRank = groupConfig.suspendedRank > 0 ? groupConfig.suspendedRank : 1;
            const role = groupRoles.find((role: any) => role.rank === demotionRank);
            await robloxGroup.updateMember(linkedUser.id, role.id);
            logAction(robloxGroup, 'Automatic Demotion', discordClient.user, '[Automatic] Admin abuse detected.', linkedUser);
        } catch (err) {};
    }
}

const clearActions = () => {
    actionCounts = [];
    setTimeout(clearActions, config.antiAbuse.clearDuration * 1000);
}

export { recordAction, clearActions };