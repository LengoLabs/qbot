import { robloxClient } from '../main';
import { config } from '../config';
import { GroupMember } from 'bloxy/dist/structures';
import { provider } from '../database/router';

let firstRecord = true;
let lastMemberCount: number;

const checkJoins = async () => {
    try {
        let robloxGroup = await robloxClient.getGroup(config.groupId)
        if(!firstRecord) {
            let amountOfMembers = robloxGroup.memberCount;
            //if(amountOfMembers === lastMemberCount) return;
            if(amountOfMembers < lastMemberCount) { lastMemberCount = amountOfMembers; return; }
            let groupUsers = await robloxGroup.getMembers({
                sortOrder: "Desc",
                limit: 100
            });
            let users = groupUsers.data;
            for(let i = 0; i < users.length; i++) {
                let userData = await provider.findUser((users[i] as any).user.userId);
                if(userData.isBanned) {
                    console.log(`Kicked ${(users[i] as any).user.username} (${(users[i] as any).user.userId})`);
                    await robloxGroup.kickMember((users[i] as any).user.userId);
                }
            }
            lastMemberCount = robloxGroup.memberCount;
        } else {
            lastMemberCount = robloxGroup.memberCount;
            firstRecord = false;
        }
        console.log("Completed checking");
    } catch(e) {
        console.error(e);
    }
    setTimeout(checkJoins, 10000);
}

export { checkJoins };