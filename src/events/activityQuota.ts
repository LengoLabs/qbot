import { DatabaseUser } from '../structures/types';
import { provider } from '../database/router';
import { robloxGroup } from '../main';
import { config } from '../config';
import { logAction } from '../handlers/handleLogging';
import { getSuccessfulDemotionEmbed } from '../handlers/locale';

const checkQuota = async () => {
    if(!config.database.enabled) return;
    const users = await provider.findAllUsers();
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
    if(lastDayOfMonth.getTime() < new Date().getTime()) {
    
    for (let i in users) {
        try {
            const robloxMember = await robloxGroup.getMember(Number(users[i].robloxId));
            const groupRoles = await robloxGroup.getRoles();
            if(robloxMember.role.rank == config.activity.quota.demoteTo) return
            if(robloxMember.role.rank > config.activity.quota.minimumRank) return
            if(!users[i].activity) return;
            if (users[i].activity < config.activity.quota.minimumRank) {
                
        try {
            await robloxGroup.updateMember(Number(users[i].robloxId), config.activity.quota.demoteTo);
        } catch (err) {
            console.log('Error with quota checking: ' + err);
        }
            }
        } catch(err) {
            console.error(err);
        }
    }
    }




    setTimeout(checkQuota, 15000);
}