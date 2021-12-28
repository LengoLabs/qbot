import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getSuccessfulRevertRanksEmbed,
    getInvalidDurationEmbed,
} from '../../handlers/locale';
import { config } from '../../config';
import { robloxClient, robloxGroup } from '../../main';
import ms from 'ms';
import { logAction } from '../../handlers/handleLogging';

class RevertRanksCommand extends Command {
    constructor() {
        super({
            trigger: 'revert-ranks',
            description: 'Reverts all ranking events within the time of the specified duration.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'duration',
                    description: 'How much time of ranking events would you like to revert?',
                    type: 'String',
                },
                {
                    trigger: 'reason',
                    description: 'If you would like a reason to be supplied in the logs, put it here.',
                    isLegacyFlag: true,
                    required: false,
                    type: 'String',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    id: config.permissions.admin,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        const auditLog = await robloxClient.apis.groupsAPI.getAuditLogs({
            groupId: robloxGroup.id,
            actionType: 'ChangeRank',
        });

        const duration = Number(ms(ctx.args['duration']));
        if(duration < 0.5 * 60000 && duration > 8.64e+7 ) return ctx.reply({ embeds: [ getInvalidDurationEmbed() ] });
        
        const maximumDate = new Date();
        maximumDate.setMilliseconds(maximumDate.getMilliseconds() - duration);

        const affectedLogs = auditLog.data.filter((log) => {
            const logCreatedDate = new Date(log.created);
            return logCreatedDate > maximumDate;
        });
        
        affectedLogs.forEach((log, index) => {
            setTimeout(async () => {
                await robloxGroup.updateMember(log.description['TargetId'], log.description['OldRoleSetId']);
            }, index * 1000);
        });

        logAction('Revert Ranks', ctx.user, ctx.args['reason'], null, null, maximumDate);
        return ctx.reply({ embeds: [ getSuccessfulRevertRanksEmbed(affectedLogs.length) ] });
    }
}

export default RevertRanksCommand;