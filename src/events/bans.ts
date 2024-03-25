import { provider } from '../database';
import { Group as RobloxGroup } from "bloxy/dist/structures";

const checkBans = async (robloxGroup: RobloxGroup) => {
    try {
        const bannedUsers = await provider.findBannedUsers();
        bannedUsers.forEach(async (user) => {
            try {
                const member = await robloxGroup.getMember(Number(user.robloxId)); 
                if(!member) throw new Error();
                if(member) {
                    await member.kickFromGroup(robloxGroup.id);
                }
            } catch (err) {};
        });
    } catch (err) {
        console.error(err);
    }
    setTimeout(checkBans, 30000);
}

export { checkBans };