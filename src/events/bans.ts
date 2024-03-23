import { robloxGroup } from '../main';
import { config } from '../config';
import { provider } from '../database';

const checkBans = async () => {
    try {
        const bannedUsers = await provider.findBannedUsers();
        bannedUsers.forEach(async (user) => {
            try {
                const member = await robloxGroup.getMember(Number(user.robloxId)); 
                if(!member) throw new Error();
                if(member) {
                    await member.kickFromGroup(config.groupId);
                }
            } catch (err) {};
        });
    } catch (err) {
        console.error(err);
    }
    setTimeout(checkBans, 30000);
}

export { checkBans };