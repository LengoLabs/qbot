import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { groupBy } from 'lodash';
import {
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    getCommandEmbedByModule,
    getTimesUpEmbed
} from '../../handlers/locale';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';

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
                {
                    trigger: "page-based",
                    description: "If any value is given, the command will be page based",
                    required: false,
                    type: "String"
                }
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
            if(!ctx.args['page-based']) {
                const categories = groupBy(commands, (cmd) => cmd.module);
                return ctx.reply({ embeds: [ getCommandListEmbed(categories) ] });
            } else {
                const categories = groupBy(commands, (cmd) => cmd.module);
                let keys = Object.keys(categories);
                let embeds = [];
                for(let i = 0; i < keys.length; i++) {
                    embeds.push({
                        module: keys[i].replace('-', ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        embed: getCommandEmbedByModule(categories, keys[i])
                    });
                }
                let index = 0;
                let previousModule = (embeds[index - 1] || embeds[embeds.length - 1]).module;
                let nextModule = (embeds[index + 1] || embeds[0]).module;
                let oldDescription = embeds[index].embed.description;
                let msg = await ctx.reply({ embeds: [ embeds[index].embed.setDescription(embeds[index].embed.description += `\n**Previous Module**: ${previousModule} ; **Next Module**: ${nextModule}`) ] });
                embeds[index].embed.setDescription(oldDescription);
                await (msg as Message).react("⬅️");
                await (msg as Message).react("➡️");
                let filter = (reaction : MessageReaction, user : User) => (reaction.emoji.name === "⬅️" || reaction.emoji.name === "➡️") && user.id === ctx.user.id;
                let reactionCollector = (msg as Message).createReactionCollector({filter: filter, time: 120000});
                reactionCollector.on('collect', async reaction => {
                    if(reaction.emoji.name === "⬅️") {
                        index = embeds.findIndex(embedObject => embedObject.module === previousModule);
                        previousModule = (embeds[index - 1] || embeds[embeds.length - 1]).module;
                        nextModule = (embeds[index + 1] || embeds[0]).module;
                        oldDescription = embeds[index].embed.description;
                    } else {
                        index = embeds.findIndex(embedObject => embedObject.module === nextModule);
                        previousModule = (embeds[index - 1] || embeds[embeds.length - 1]).module;
                        nextModule = (embeds[index + 1] || embeds[0]).module;
                        oldDescription = embeds[index].embed.description;
                    }
                    await (msg as Message).edit({ embeds: [ embeds[index].embed.setDescription(embeds[index].embed.description += `\n**Previous Module**: ${previousModule} ; **Next Module**: ${nextModule}`) ] });
                    embeds[index].embed.setDescription(oldDescription);
                    await (msg as Message).reactions.removeAll();
                    await (msg as Message).react("⬅️");
                    await (msg as Message).react("➡️");
                });
                reactionCollector.on('end', async () => {
                    return await (msg as Message).reply({ embeds: [ getTimesUpEmbed() ] });
                });             
            }
        }
    }
}

export default HelpCommand;