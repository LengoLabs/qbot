import { GroupMember, GroupRole } from 'bloxy/dist/structures';
import { config } from '../config';

const findEligibleRole = async (member: GroupMember, roles: GroupRole[], xp: number): Promise<GroupRole> => {
    const role = roles.find((role) => role.rank === config.xpSystem.roles.sort((a, b) => a.xp - b.xp).find((role) => xp >= role.xp)?.rank);
    if(role && member.role.id === role.id) return null;
    return role;
}

export { findEligibleRole };