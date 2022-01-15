import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { User } from 'bloxy/dist/structures';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { config } from '../../config';
import {
    getNoDatabaseEmbed,
    getUnexpectedErrorEmbed,
    getNoUsersWithXPEmbed,
    getXPLeaderBoardEmbed
} from '../../handlers/locale';
import { provider } from '../../database/router';

class XPLeaderBoardCommand extends Command {
    constructor() {
        super({
            trigger: "xpleaderboard",
            description: "Shows the XP leaderboard",
            type: "ChatInput",
            module: "xp"
        });
    }

    async run(ctx: CommandContext) {
        if(!config.database.enabled) return ctx.reply({ embeds: [ getNoDatabaseEmbed() ] });
        let users;
        try {
            users = await provider.findTopUsers();
        } catch(e) {
            console.log(e);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ] });
        }
        if(users.length === 0) return ctx.reply({ embeds: [ getNoUsersWithXPEmbed() ] });
        return await ctx.reply({ embeds: [ await getXPLeaderBoardEmbed(users) ] });
    }
}

export default XPLeaderBoardCommand;