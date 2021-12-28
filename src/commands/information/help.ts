import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { groupBy } from 'lodash';
import {
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
} from '../../handlers/locale';

class HelpCommand extends Command {
    constructor() {
        super({
            trigger: 'help',
            description: 'Gets a list of commands to try.',
            type: 'ChatInput',
            module: 'information',
            args: [
                {
                    trigger: 'command-name',
                    description: 'What command would you like to learn more about, if any?',
                    required: false,
                    type: 'String',
                },
            ]
        });
    }

    async run(ctx: CommandContext) {
        const commands = discordClient.commands.map((cmd) => new(cmd));
        if(ctx.args['command-name']) {
            const command = commands.find((cmd) => cmd.trigger.toLowerCase() === ctx.args['command-name'].toLowerCase() || cmd.aliases.map((alias) => alias.toLowerCase()).includes(ctx.args['command-name'].toLowerCase()));
            if(!command) return ctx.reply({ embeds: [ getCommandNotFoundEmbed() ] });
            return ctx.reply({ embeds: [ getCommandInfoEmbed(command) ] });
        } else {
            const categories = groupBy(commands, (cmd) => cmd.module);
            return ctx.reply({ embeds: [ getCommandListEmbed(categories) ] });
        }
    }
}

export default HelpCommand;