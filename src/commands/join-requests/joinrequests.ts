import { robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { getJoinRequestsEmbed, getInvalidRobloxGroupEmbed, getNoPermissionEmbed } from '../../handlers/locale';
import { config } from '../../config';
import { Group } from 'bloxy/dist/structures';

class JoinRequestsCommand extends Command {
    constructor() {
        super({
            trigger: 'joinrequests',
            description: 'Gets a list of pending join requests.',
            type: 'ChatInput',
            module: 'join-requests',
            args: [
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
                    ids: config.basePermissions.join,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        let robloxGroup: Group;

        const groupConfig = config.groups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
        if(!groupConfig) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
        if(!ctx.checkSecondaryPermissions(groupConfig.permissions, "join")) return ctx.reply({ embeds: [ getNoPermissionEmbed() ] });
        robloxGroup = await robloxClient.getGroup(groupConfig.groupId);

        const joinRequests = await robloxGroup.getJoinRequests({});
        return await ctx.reply({ embeds: [ getJoinRequestsEmbed(joinRequests.data) ] });
    }
}

export default JoinRequestsCommand;