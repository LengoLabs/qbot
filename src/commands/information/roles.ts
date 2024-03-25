import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { robloxClient } from '../../main';
import { getRoleListEmbed, getInvalidRobloxGroupEmbed } from '../../handlers/locale';
import { Group } from 'bloxy/dist/structures';

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
        let robloxGroup: Group;

        const groupConfig = config.groups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
        if(!groupConfig) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
        robloxGroup = await robloxClient.getGroup(groupConfig.groupId);

        const roles = await robloxGroup.getRoles();
        return ctx.reply({ embeds: [ getRoleListEmbed(roles) ] });
    }
}

export default RolesCommand;