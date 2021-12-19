import { robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getSuccessfulFireEmbed,
    getUnexpectedErrorEmbed,
} from '../../handlers/locale';
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
        } catch (err) {
            return ctx.reply({ embeds: [ getRobloxUserIsNotMemberEmbed() ]});
        }

        try {
            const groupRoles = await robloxGroup.getRoles();
            const firedRank = groupRoles.find((role) => role.rank === config.firedRank);
            await robloxGroup.updateMember(robloxUser.id, firedRank.id);
            const currentRoleIndex = groupRoles.findIndex((role) => role.id === robloxMember.role.id);
            ctx.reply({ embeds: [ await getSuccessfulFireEmbed(robloxUser, firedRank.name) ]})
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default PromoteCommand;