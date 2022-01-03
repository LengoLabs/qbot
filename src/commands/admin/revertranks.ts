import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getSuccessfulRevertRanksEmbed,
    getInvalidDurationEmbed,
    getInvalidRobloxUserEmbed,
} from '../../handlers/locale';
import { config } from '../../config';
import { discordClient, robloxClient, robloxGroup } from '../../main';
import ms from 'ms';
import { logAction } from '../../handlers/handleLogging';
import { PartialUser, User } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';

class RevertRanksCommand extends Command {
    constructor() {
        super({
            trigger: 'revertranks',
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
                    trigger: 'filter',
                    description: 'Do you want to filter actions to a specific Roblox user?',
                    autocomplete: true,
                    required: false,
                    type: 'RobloxUser',
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
                    ids: config.permissions.admin,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        console.log('a');
        let robloxUser: User | PartialUser;
        if(ctx.args['filter']) {
            try {
                robloxUser = await robloxClient.getUser(ctx.args['filter'] as number);
            } catch (err) {
                try {
                    const robloxUsers = await robloxClient.getUsersByUsernames([ ctx.args['filter'] as string ]);
                    if(robloxUsers.length === 0) throw new Error();
                    robloxUser = robloxUsers[0];
                } catch (err) {
                    try {
                        const idQuery = ctx.args['filter'].replace(/[^0-9]/gm, '');
                        const discordUser = await discordClient.users.fetch(idQuery);
                        const linkedUser = await getLinkedRobloxUser(discordUser.id, ctx.guild.id);
                        if(!linkedUser) throw new Error();
                        robloxUser = linkedUser;
                    } catch (err) {
                        return ctx.reply({ embeds: [ getInvalidRobloxUserEmbed() ]});
                    }
                }
            }
        }
        
        console.log('b');
        const auditLog = await robloxClient.apis.groupsAPI.getAuditLogs({
            groupId: robloxGroup.id,
            actionType: 'ChangeRank',
            limit: 100,
        });

        let duration: number;
        try {
            duration = Number(ms(ctx.args['duration']));
            if(duration < 0.5 * 60000 && duration > 8.64e+7 ) return ctx.reply({ embeds: [ getInvalidDurationEmbed() ] });
        } catch (err) {
            return ctx.reply({ embeds: [ getInvalidDurationEmbed() ] });
        }
        
        const maximumDate = new Date();
        maximumDate.setMilliseconds(maximumDate.getMilliseconds() - duration);

        console.log('c');
        const affectedLogs = auditLog.data.filter((log) => {
            if(log.actor.user.userId === robloxClient.user.id && !(robloxUser && robloxUser.id === robloxClient.user.id)) return;
            if(robloxUser && robloxUser.id !== log.actor.user.userId) return;
            const logCreatedDate = new Date(log.created);
            return logCreatedDate > maximumDate;
        });
        console.log('d');
        
        affectedLogs.forEach(async (log, index) => {
            setTimeout(async () => {
                await robloxGroup.updateMember(log.description['TargetId'], log.description['OldRoleSetId']);
            }, index * 1000);
        });

        console.log('e');
        logAction('Revert Ranks', ctx.user, ctx.args['reason'], null, null, maximumDate);
        return ctx.reply({ embeds: [ getSuccessfulRevertRanksEmbed(affectedLogs.length) ] });
    }
}

export default RevertRanksCommand;