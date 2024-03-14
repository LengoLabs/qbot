import { User, Group, GroupMember } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from './accountLinks';

const checkActionEligibility = async (group: Group, discordId: string, guildId: string, targetMember: GroupMember, rankingTo: number): Promise<boolean>  => {
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