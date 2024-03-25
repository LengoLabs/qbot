import { discordClient, robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulSuspendEmbed,
    getUnexpectedErrorEmbed,
    getVerificationChecksFailedEmbed,
    getRoleNotFoundEmbed,
    getInvalidDurationEmbed,
    getAlreadySuspendedEmbed,
    noSuspendedRankLog,
    getInvalidRobloxGroupEmbed,
    getNoPermissionEmbed
} from '../../handlers/locale';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { config } from '../../config';
import { User, PartialUser, GroupMember, Group } from 'bloxy/dist/structures';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import ms from 'ms';
import { provider } from '../../database';

class SuspendCommand extends Command {
    constructor() {
        super({
            trigger: 'suspend',
            description: 'Temporarily fires a user.',
            type: 'ChatInput',
            module: 'suspensions',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to suspend?',
                    autocomplete: true,
                    type: 'String',
                },
                {
                    trigger: 'duration',
                    description: 'How long should they be suspended for? (Format example: 1d, 3d12h, 3 days)',
                    type: 'String',
                },
                {
                    trigger: 'reason',
                    description: 'If you would like a reason to be supplied in the logs, put it here.',
                    isLegacyFlag: true,
                    required: false,
                    type: 'String',
                },
                {
                    trigger: 'group',
                    description: 'Which group would you like to run this action in?',
                    isLegacyFlag: true,
                    autocomplete: true,
                    required: true,
                    type: 'Group',
                }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.basePermissions.ranking,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        let robloxGroup: Group;

        const groupConfig = config.groups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
        if(!groupConfig) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
        if(!ctx.checkSecondaryPermissions(groupConfig.permissions, "ranking")) return ctx.reply({ embeds: [ getNoPermissionEmbed() ] });
        robloxGroup = await robloxClient.getGroup(groupConfig.groupId);

        let robloxUser: User | PartialUser;
        try {
            robloxUser = await robloxClient.getUser(ctx.args['roblox-user'] as number);
        } catch (err) {
            try {
                const robloxUsers = await robloxClient.getUsersByUsernames([ ctx.args['roblox-user'] as string ]);
                if(robloxUsers.length === 0) throw new Error();
                robloxUser = robloxUsers[0];
            } catch (err) {
                try {
                    const idQuery = ctx.args['roblox-user'].replace(/[^0-9]/gm, '');
                    const discordUser = await discordClient.users.fetch(idQuery);
                    const linkedUser = await getLinkedRobloxUser(discordUser.id);
                    if(!linkedUser) throw new Error();
                    robloxUser = linkedUser;
                } catch (err) {
                    return ctx.reply({ embeds: [ getInvalidRobloxUserEmbed() ]});
                }
            }
        }

        let robloxMember: GroupMember;
        try {
            robloxMember = await robloxGroup.getMember(robloxUser.id);
            if(!robloxMember) throw new Error();
        } catch (err) {
            return ctx.reply({ embeds: [ getRobloxUserIsNotMemberEmbed() ]});
        }

        let duration: number;
        try {
            duration = Number(ms(ctx.args['duration']));
            if(!duration) throw new Error();
            if(duration < 0.5 * 60000 && duration > 6.31138519 * (10 ^ 10) ) return ctx.reply({ embeds: [ getInvalidDurationEmbed() ] });
        } catch (err) {
            return ctx.reply({ embeds: [ getInvalidDurationEmbed() ] });
        }
        
        const endDate = new Date();
        endDate.setMilliseconds(endDate.getMilliseconds() + duration);

        const groupRoles = await robloxGroup.getRoles();
        const role = groupRoles.find((role) => role.rank === groupConfig.suspendedRank);
        if(!role) {
            console.error(noSuspendedRankLog);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
        if(role.rank > groupConfig.maximumRank || robloxMember.role.rank > groupConfig.maximumRank) return ctx.reply({ embeds: [ getRoleNotFoundEmbed() ] });

        if(config.verificationChecks.enabled) {
            const actionEligibility = await checkActionEligibility(robloxGroup, ctx.user.id, ctx.member.roles.cache.map((r) => r.id), ctx.guild.id, robloxMember, role.rank);
            if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });
        }

        const userData = await provider.findUser(robloxUser.id.toString());
        if(userData.suspendedUntil) return ctx.reply({ embeds: [ getAlreadySuspendedEmbed() ] });
        await provider.updateUser(robloxUser.id.toString(), { suspendedUntil: endDate, unsuspendRank: robloxMember.role.id });

        try {
            if(robloxMember.role.id !== role.id) await robloxGroup.updateMember(robloxUser.id, role.id);
            ctx.reply({ embeds: [ await getSuccessfulSuspendEmbed(robloxUser, role.name, endDate) ]});
            logAction(robloxGroup, 'Suspend', ctx.user, ctx.args['reason'], robloxUser, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`, endDate);
        } catch (err) {
            console.error(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default SuspendCommand;
