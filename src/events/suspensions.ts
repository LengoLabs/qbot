import { DatabaseUser } from '../structures/types';
import { provider } from '../database';
import { robloxGroup } from '../main';
import { config } from '../config';

const checkSuspensions = async () => {
    const suspensions = await provider.findSuspendedUsers();
    suspensions.forEach(async (suspension) => {
        try {
            const robloxMember = await robloxGroup.getMember(Number(suspension.robloxId));
            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === config.suspendedRank);
            if(robloxMember.role.rank !== config.suspendedRank) await robloxGroup.updateMember(robloxMember.id, role.id);
            if(!suspension.suspendedUntil) return;
            if(suspension.suspendedUntil.getTime() < new Date().getTime()) {
                await provider.updateUser(suspension.robloxId, { suspendedUntil: null, unsuspendRank: null });
                const unsuspendRole = groupRoles.find((role) => role.id === suspension.unsuspendRank);
                if(unsuspendRole.rank === config.suspendedRank) return;
                await robloxGroup.updateMember(robloxMember.id, unsuspendRole.id);
            }
        } catch(err) {
            console.error(err);
        }
    });
    setTimeout(checkSuspensions, 15000);
}

export { checkSuspensions };
