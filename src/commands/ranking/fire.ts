import { discordClient, robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulFireEmbed,
    getUnexpectedErrorEmbed,
    getVerificationChecksFailedEmbed,
    getAlreadyFiredEmbed,
    getRoleNotFoundEmbed,
    noFiredRankLog,
    getUserSuspendedEmbed,
    getInvalidRobloxGroupEmbed,
    getNoPermissionEmbed
} from '../../handlers/locale';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { config } from '../../config';
import { User, PartialUser, GroupMember, Group } from 'bloxy/dist/structures';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { provider } from '../../database';

class FireCommand extends Command {
    constructor() {
        super({
            trigger: 'fire',
            description: 'Sets a users rank in the Roblox group to 1.',
            type: 'ChatInput',
            module: 'ranking',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to fire?',
                    autocomplete: true,
                    type: 'RobloxUser',
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
        if(!ctx.checkSecondaryPermissions(groupConfig.permissions, ctx.command.module)) return ctx.reply({ embeds: [ getNoPermissionEmbed() ] });
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

        const groupRoles = await robloxGroup.getRoles();
        const role = groupRoles.find((role) => role.rank === groupConfig.firedRank);
        
        if(!role) {
            console.error(noFiredRankLog);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }

        if(robloxMember.role.rank === groupConfig.firedRank) return ctx.reply({ embeds: [ getAlreadyFiredEmbed() ] });
        if(role.rank > groupConfig.maximumRank || robloxMember.role.rank > groupConfig.maximumRank) return ctx.reply({ embeds: [ getRoleNotFoundEmbed() ] });

        if(config.verificationChecks.enabled) {
            const actionEligibility = await checkActionEligibility(robloxGroup, ctx.user.id, ctx.member.roles.cache.map((r) => r.id), ctx.guild.id, robloxMember, role.rank);
            if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });
        }

        const userData = await provider.findUser(robloxUser.id.toString());
        if(userData.xp !== 0) return provider.updateUser(robloxUser.id.toString(), { xp: 0 });
        if(userData.suspendedUntil) return ctx.reply({ embeds: [ getUserSuspendedEmbed() ] });

        try {
            await robloxGroup.updateMember(robloxUser.id, role.id);
            ctx.reply({ embeds: [ await getSuccessfulFireEmbed(robloxUser, role.name) ]});
            logAction(robloxGroup, 'Fire', ctx.user, ctx.args['reason'], robloxUser, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`, null, null, null);
        } catch (err) {
            console.error(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default FireCommand;
