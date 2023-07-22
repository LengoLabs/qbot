import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getUnexpectedErrorEmbed,
    getSuccessfulDenyJoinRequestEmbed,
    getNoJoinRequestEmbed,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser } from 'bloxy/dist/structures';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';

class DenyJoinCommand extends Command {
    constructor() {
        super({
            trigger: 'denyjoin',
            description: 'Denies the join request from a user.',
            type: 'ChatInput',
            module: 'join-requests',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Whose join request do you want to deny?',
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
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.join,
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

        const joinRequest = await robloxUser.getJoinRequestInGroup(config.groupId);
        if(!joinRequest) return ctx.reply({ embeds: [ getNoJoinRequestEmbed() ] });

        try {
            await robloxGroup.declineJoinRequest(robloxUser.id);
            ctx.reply({ embeds: [ await getSuccessfulDenyJoinRequestEmbed(robloxUser) ]});
            logAction('Deny Join Request', ctx.user, ctx.args['reason'], robloxUser);
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default DenyJoinCommand;