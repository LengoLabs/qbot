import { robloxGroup as defaultRobloxGroup, robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getUnexpectedErrorEmbed,
    getSuccessfulShoutEmbed,
    getInvalidRobloxGroupEmbed,
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
        let robloxGroup: Group = defaultRobloxGroup;
        if(ctx.args['group']) {
            const secondaryGroup = config.secondaryGroups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
            if(!secondaryGroup) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
            robloxGroup = await robloxClient.getGroup(secondaryGroup.id);
        }

        try {
            await robloxGroup.updateShout(ctx.args['content'] || '');
            ctx.reply({ embeds: [ await getSuccessfulShoutEmbed() ]});
            logAction('Shout', ctx.user, ctx.args['reason'], null, null, null, ctx.args['content'] || '*Cleared.*');
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default ShoutCommand;