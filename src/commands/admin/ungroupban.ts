import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { discordClient, robloxClient } from '../../main';
import { User, PartialUser, Group } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { provider } from '../../database';
import { logAction } from '../../handlers/handleLogging';
import {
    getInvalidRobloxUserEmbed,
    getUnexpectedErrorEmbed,
    getSuccessfulGroupUnbanEmbed,
    getUserNotBannedEmbed,
    getInvalidRobloxGroupEmbed,
    getNoPermissionEmbed
} from '../../handlers/locale';
import { config } from '../../config';

class UnGroupBanCommand extends Command {
    constructor() {
        super({
            trigger: 'ungroupban',
            description: 'Unbans someone from the group',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you wish to unban from the group?',
                    autocomplete: true,
                    required: true,
                    type: 'RobloxUser'
                },
                {
                    trigger: 'reason',
                    description: 'If you would like a reason to be supplied in the logs, put it here.',
                    required: false,
                    type: 'String'
                },{
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
                    ids: config.basePermissions.admin,
                    value: true,
                }
            ]
        })
    };

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

        const userData = await provider.findUser(robloxUser.id.toString());
        if(!userData.isBanned) return ctx.reply({ embeds: [ getUserNotBannedEmbed() ] });

        try {
            await provider.updateUser(robloxUser.id.toString(), {
                isBanned: false
            });
            logAction(robloxGroup, 'Ungroup Ban', ctx.user, ctx.args['reason'], robloxUser);
            return ctx.reply({ embeds: [ getSuccessfulGroupUnbanEmbed(robloxUser) ]});
        } catch(e) {
            console.log(e);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default UnGroupBanCommand;
