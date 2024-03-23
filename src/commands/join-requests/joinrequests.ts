import { robloxGroup as defaultRobloxGroup, robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { getJoinRequestsEmbed, getInvalidRobloxGroupEmbed } from '../../handlers/locale';
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
                    ids: config.permissions.join,
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

        const joinRequests = await robloxGroup.getJoinRequests({});
        return await ctx.reply({ embeds: [ getJoinRequestsEmbed(joinRequests.data) ] });
    }
}

export default JoinRequestsCommand;