import { robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getUnexpectedErrorEmbed,
    getSuccessfulShoutEmbed,
    getInvalidRobloxGroupEmbed,
    getNoPermissionEmbed
} from '../../handlers/locale';
import { config } from '../../config';
import { logAction } from '../../handlers/handleLogging';
import { Group } from 'bloxy/dist/structures';

class ShoutCommand extends Command {
    constructor() {
        super({
            trigger: 'shout',
            description: 'Posts a shout on the Roblox group.',
            type: 'ChatInput',
            module: 'shout',
            args: [
                {
                    trigger: 'content',
                    description: 'What should the content of the shout be? If none, the shout will be cleared.',
                    required: false,
                    type: 'String',
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
                    ids: config.basePermissions.shout,
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

        try {
            await robloxGroup.updateShout(ctx.args['content'] || '');
            ctx.reply({ embeds: [ await getSuccessfulShoutEmbed() ]});
            logAction(robloxGroup, 'Shout', ctx.user, ctx.args['reason'], null, null, null, ctx.args['content'] || '*Cleared.*');
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default ShoutCommand;