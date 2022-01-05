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
} from '../../handlers/locale';
import { provider } from '../../database/router';

class AddActivityCommand extends Command {
    constructor() {
        super({
            trigger: 'addactivity',
            description: 'Adds time to a user',
            type: 'ChatInput',
            module: 'activity',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to add activity to?',
                    autocomplete: true,
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'amount',
                    description: 'How many minutes do you want to add?',
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
        let toAdd = userData.activity + ctx.args['amount'];
        await provider.updateUser(id.toString(), { activity: toAdd });
        return ctx.reply({embeds: [addedActivityEmbed(ctx.args['amount'],name)]})
    }
}

export default AddActivityCommand;