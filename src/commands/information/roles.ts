import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { robloxClient, getClient } from '../../main';
import { getRoleListEmbed, getInvalidRobloxGroupEmbed } from '../../handlers/locale';
import { Group as RobloxGroup } from 'bloxy/dist/structures';

class RolesCommand extends Command {
    constructor() {
        super({
            trigger: 'roles',
            description: 'Displays a list of roles on the group.',
            type: 'ChatInput',
            module: 'information',
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
        });
    }

    async run(ctx: CommandContext) {
        const groupConfig = config.groups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
        if (!groupConfig) return ctx.reply({ embeds: [getInvalidRobloxGroupEmbed()] });
        const robloxGroup: RobloxGroup = await robloxClient.getGroup(Number(groupConfig.groupId));
        return ctx.reply({ embeds: [await getRoleListEmbed(robloxGroup)] });
    }
}

export default RolesCommand;