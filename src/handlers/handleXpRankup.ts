import { Group, GroupMember, GroupRole } from 'bloxy/dist/structures';
import { config, findGroupById } from '../config';

const findEligibleRole = async (member: GroupMember, robloxGroup: Group, xp: number): Promise<GroupRole> => {
    const groupConfig = await findGroupById(robloxGroup.id);
    const roles: GroupRole[] = await robloxGroup.getRoles();
    const role = roles.find((role) => role.rank === groupConfig.xpSystem.roles.sort((a, b) => a.xp + b.xp).find((role) => xp >= role.xp)?.rank);
    if(role && (member.role.id === role.id || role.rank <= member.role.rank)) return null;
    return role;
}

export { findEligibleRole };
