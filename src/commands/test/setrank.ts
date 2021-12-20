import { robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulDemotionEmbed,
    getUnexpectedErrorEmbed,
    getRoleNotFoundEmbed,
    getVerificationChecksFailedEmbed,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
import { checkActionEligibility } from '../../handlers/verificationChecks';

class SetRankCommand extends Command {
    constructor() {
        super({
            trigger: 'setrank',
            description: 'Changes the rank of a user in the Roblox group.',
            type: 'ChatInput',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Whose rank would you like to change?',
                    autocomplete: true,
                    type: 'String',
                },
                {
                    trigger: 'roblox-role',
                    description: 'What role would you like to change them to?',
                    autocomplete: true,
                    type: 'String',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    id: config.permissions.ranking,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        let robloxUser: User | PartialUser;
        try {
            robloxUser = await robloxClient.getUser(ctx.args['roblox-user'] as number);
        } catch (err) {
            try {
                const robloxUsers = await robloxClient.getUsersByUsernames([ ctx.args['roblox-user'] as string ]);
                if(robloxUsers.length === 0) throw new Error();
                robloxUser = robloxUsers[0];
            } catch (err) {
                return ctx.reply({ embeds: [ getInvalidRobloxUserEmbed() ]});
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
        if(!role || role.rank === 0 || role.rank > config.maximumRank) return ctx.reply({ embeds: [ getRoleNotFoundEmbed() ]});

        const actionEligibility = await checkActionEligibility(ctx.user.id, ctx.guild.id, robloxMember, role.rank);
        if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });

        try {
            const groupRoles = await robloxGroup.getRoles();
            await robloxGroup.updateMember(robloxUser.id, role.id);
            const currentRoleIndex = groupRoles.findIndex((role) => role.id === robloxMember.role.id);
            ctx.reply({ embeds: [ await getSuccessfulDemotionEmbed(robloxUser, role.name) ]})
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default SetRankCommand;