import { provider } from '../database';
import { config } from '../config';
import { Group as RobloxGroup } from "bloxy/dist/structures";
import { GroupConfig } from '../structures/types';

const checkSuspensions = async (robloxGroup: RobloxGroup, groupConfig: GroupConfig) => {
    const suspensions = await provider.findSuspendedUsers();
    suspensions.forEach(async (suspension) => {
        try {
            const robloxMember = await robloxGroup.getMember(Number(suspension.robloxId));
            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === groupConfig.suspendedRank);
            if(robloxMember.role.rank !== groupConfig.suspendedRank) await robloxGroup.updateMember(robloxMember.id, role.id);
            if(!suspension.suspendedUntil) return;
            if(suspension.suspendedUntil.getTime() < new Date().getTime()) {
                await provider.updateUser(suspension.robloxId, { suspendedUntil: null, unsuspendRank: null });
                const unsuspendRole = groupRoles.find((role) => role.id === suspension.unsuspendRank);
                if(unsuspendRole.rank === groupConfig.suspendedRank) return;
                await robloxGroup.updateMember(robloxMember.id, unsuspendRole.id);
            }
        } catch(err) {
            console.error(err);
        }
    });
    setTimeout(checkSuspensions, 15000);
}

export { checkSuspensions };
