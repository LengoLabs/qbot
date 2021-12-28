import { robloxClient, robloxGroup } from '../main';
import { logAction } from '../handlers/handleLogging';

let lastRecordedDate: Date;

const recordAuditLogs = async () => {
    try {
        const auditLog = await robloxClient.apis.groupsAPI.getAuditLogs({
            groupId: robloxGroup.id,
            actionType: null,
        });
        const mostRecentDate = new Date(auditLog.data[0].created);
        if(lastRecordedDate) {
            const groupRoles = await robloxGroup.getRoles();
            auditLog.data.forEach(async (log) => {
                if(log.actionType !== 'ChangeRank') return;
                if(robloxClient.user.id !== log.actor.user.userId) {
                    const logCreationDate = new Date(log.created);
                    if(logCreationDate.getTime() > lastRecordedDate.getTime()) {
                        const oldRole = groupRoles.find((role) => role.id === log.description['OldRoleSetId']);
                        const newRole = groupRoles.find((role) => role.id === log.description['NewRoleSetId']);
                        const target = await robloxClient.getUser(log.description['TargetId']);
                        logAction('Manual Set Rank', log.actor.user, null, target, `${oldRole.name} (${oldRole.rank}) → ${newRole.name} (${newRole.rank})`);
                    }
                }
            });
            lastRecordedDate = mostRecentDate;
        } else {
            lastRecordedDate = mostRecentDate;
        }
    } catch (err) {
        console.error(err);
    }
    setTimeout(recordAuditLogs, 30000);
}

export { recordAuditLogs };