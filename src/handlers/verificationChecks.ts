import { User, Group, GroupMember } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from './accountLinks';
import { discordClient } from '../main';
import { config } from '../config';

const checkActionEligibility = async (group: Group, discordId: string, memberRoles: string[], guildId: string, targetMember: GroupMember, rankingTo: number): Promise<boolean>  => {
    if(memberRoles.some((r) => config.verificationChecks.bypassRoleIds.includes(r))) return true;    

    let robloxUser: User;
    try {
        robloxUser = await getLinkedRobloxUser(discordId);
    } catch (err) {
        return false;
    }

    let robloxMember: GroupMember;
    try {
        robloxMember = await group.getMember(robloxUser.id);
        if(!robloxMember) throw new Error();
    } catch (err) {
        return false;
    }

    if(robloxMember.role.rank <= targetMember.role.rank) return false;
    if(robloxMember.role.rank <= rankingTo) return false;
    if(robloxMember.id === targetMember.id) return false;
    return true;
}

export { checkActionEligibility };