import { robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulFireEmbed,
    getUnexpectedErrorEmbed,
    getVerificationChecksFailedEmbed,
    noFiredRankLog,
} from '../../handlers/locale';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';

class PromoteCommand extends Command {
    constructor() {
        super({
            trigger: 'fire',
            description: 'Sets a users rank in the Roblox group to 1.',
            type: 'ChatInput',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to fire?',
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
        const role = groupRoles.find((role) => role.rank === config.firedRank);
        if(!role) {
            console.log('Uh oh, it looks like you do not')
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }

        const actionEligibility = checkActionEligibility(ctx.user.id, ctx.guild.id, robloxMember, role.rank);
        if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });

        try {
            await robloxGroup.updateMember(robloxUser.id, role.id);
            const currentRoleIndex = groupRoles.findIndex((role) => role.id === robloxMember.role.id);
            ctx.reply({ embeds: [ await getSuccessfulFireEmbed(robloxUser, role.name) ]});
        } catch (err) {
            console.error(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default PromoteCommand;