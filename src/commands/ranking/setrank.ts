import { discordClient, robloxClient, robloxGroup as defaultRobloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulSetRankEmbed,
    getUnexpectedErrorEmbed,
    getRoleNotFoundEmbed,
    getVerificationChecksFailedEmbed,
    getAlreadyRankedEmbed,
    getUserSuspendedEmbed,
    getInvalidRobloxGroupEmbed,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember, Group } from 'bloxy/dist/structures';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { provider } from '../../database';

class SetRankCommand extends Command {
    constructor() {
        super({
            trigger: 'setrank',
            description: 'Changes the rank of a user in the Roblox group.',
            type: 'ChatInput',
            module: 'ranking',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Whose rank would you like to change?',
                    autocomplete: true,
                    type: 'RobloxUser',
                },
                {
                    trigger: 'roblox-role',
                    description: 'What role would you like to change them to?',
                    autocomplete: true,
                    type: 'RobloxRole',
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
                    description: 'Which secondary group would you like to run this action in, if any?',
                    isLegacyFlag: true,
                    autocomplete: true,
                    required: false,
                    type: 'SecondaryGroup',
                }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.ranking,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        let robloxGroup: Group = defaultRobloxGroup;
        if(ctx.args['group']) {
            const secondaryGroup = config.secondaryGroups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
            if(!secondaryGroup) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
            robloxGroup = await robloxClient.getGroup(secondaryGroup.id);
        }

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
        const role = groupRoles.find((role) => role.id == ctx.args['roblox-role'] || role.rank == ctx.args['roblox-role'] || role.name.toLowerCase().startsWith(ctx.args['roblox-role'].toLowerCase()));
        if(!role || !role.rank || role.rank === 0 || role.rank > config.maximumRank || robloxMember.role.rank > config.maximumRank) return ctx.reply({ embeds: [ getRoleNotFoundEmbed() ]});
        if(robloxMember.role.id === role.id) return ctx.reply({ embeds: [ getAlreadyRankedEmbed() ] });

        if(config.verificationChecks.enabled) {
            const actionEligibility = await checkActionEligibility(robloxGroup, ctx.user.id, ctx.member.roles.cache.map((r) => r.id), ctx.guild.id, robloxMember, role.rank);
            if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });
        }

        const userData = await provider.findUser(robloxUser.id.toString());
        if(userData.suspendedUntil) return ctx.reply({ embeds: [ getUserSuspendedEmbed() ] });

        try {
            await robloxGroup.updateMember(robloxUser.id, role.id);
            ctx.reply({ embeds: [ await getSuccessfulSetRankEmbed(robloxUser, role.name) ]})
            logAction('Update Rank', ctx.user, ctx.args['reason'], robloxUser, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default SetRankCommand;
