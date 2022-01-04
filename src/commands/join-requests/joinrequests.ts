import { robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { getJoinRequestsEmbed } from '../../handlers/locale';
import { config } from '../../config';

class JoinRequestsCommand extends Command {
    constructor() {
        super({
            trigger: 'joinrequests',
            description: 'Gets a list of pending join requests.',
            type: 'ChatInput',
            module: 'join-requests',
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
        const joinRequests = await robloxGroup.getJoinRequests({});
        return await ctx.reply({ embeds: [ getJoinRequestsEmbed(joinRequests.data) ] });
    }
}

export default JoinRequestsCommand;