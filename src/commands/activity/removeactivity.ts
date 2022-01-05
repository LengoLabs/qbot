import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { PartialUser, User, GroupMember } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { config } from '../../config';
import {
    addedActivityEmbed,
    getActivityEmbed,
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getUnexpectedErrorEmbed,
    getUserInfoEmbed,
    removedActivityEmbed,
} from '../../handlers/locale';
import { provider } from '../../database/router';

class RemoveActivityCommand extends Command {
    constructor() {
        super({
            trigger: 'removeactivity',
            description: 'Removes time from a user',
            type: 'ChatInput',
            module: 'activity',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to remove activity from?',
                    autocomplete: true,
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'amount',
                    description: 'How many minutes do you want to remove?',
                    autocomplete: false,
                    required: true,
                    type: 'String',
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        if(!config.database.enabled) return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ] });
        let name = ctx.args['roblox-user'];
        let id = robloxClient.getUserIdFromUsername(name);
        let userData = await provider.findUser(id.toString());
        let toRemove = userData.activity - ctx.args['amount'];
        await provider.updateUser(id.toString(), { activity: toRemove });
        return ctx.reply({embeds: [removedActivityEmbed(ctx.args['amount'],name)]})
    }
}

export default RemoveActivityCommand;