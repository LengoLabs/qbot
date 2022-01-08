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
                    const linkedUser = await getLinkedRobloxUser(discordUser.id, ctx.guild.id);
                    if(!linkedUser) throw new Error();
                    robloxUser = linkedUser;
                } catch (err) {
                    return ctx.reply({ embeds: [ getInvalidRobloxUserEmbed() ]});
                }
            }
        }

        let robloxMember: GroupMember;
        try {
            robloxMember = await robloxGroup.getMember(robloxUser.id);
            if(!robloxMember) throw new Error();
        } catch (err) {
            return ctx.reply({ embeds: [ getRobloxUserIsNotMemberEmbed() ]});
        }
        let userData = await provider.findUser(robloxUser.id.toString());
        let toAdd = userData.activity - ctx.args['amount'];
        await provider.updateUser(robloxUser.id.toString(), { activity: toAdd });
        return ctx.reply({embeds: [addedActivityEmbed(ctx.args['amount'],robloxUser.name)]})
    }
}

export default RemoveActivityCommand;