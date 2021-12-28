import { User } from 'discord.js';
import { config } from '../config';
import { discordClient, robloxGroup } from '../main';
import { getLinkedRobloxUser } from './accountLinks';
import { logAction } from './handleLogging';

let actionCounts = [];

const recordAction = async (moderator: User) => {
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
            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === config.antiAbuse.demotionRank);
            await robloxGroup.updateMember(linkedUser.id, role.id);
            logAction('Automatic Demotion', discordClient.user, '[Automatic] Admin abuse detected.', linkedUser);
        } catch (err) {};
    }
}

export { recordAction };