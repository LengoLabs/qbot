import { GroupMember, User } from 'bloxy/dist/structures';
import { robloxGroup } from '../main';
import { getLinkedRobloxUser } from './accountLinks';

const checkActionEligibility = async (discordId: string, guildId: string, targetMember: GroupMember, rankingTo: number): Promise<boolean>  => {
    return true;
    let robloxUser: User;
    try {
        robloxUser = await getLinkedRobloxUser(discordId, guildId);
    } catch (err) {
        return false;
    }

    let robloxMember: GroupMember;
    try {
        robloxMember = await robloxGroup.getMember(robloxUser.id);
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