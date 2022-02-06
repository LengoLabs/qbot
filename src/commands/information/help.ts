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

import {
    Message,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageButtonStyleResolvable,
    Interaction,
    ButtonInteraction,
    CommandInteraction
} from 'discord.js';

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

    addButton(messageData : any, id : string, label : string, style : MessageButtonStyleResolvable) {
        let components = messageData.components || [];
        let newComponent = new MessageActionRow().addComponents(new MessageButton().setCustomId(id).setLabel(label).setStyle(style));
        components.push(newComponent);
        messageData.components = components;
    }

    async run(ctx: CommandContext) {
        const commands = discordClient.commands.map((cmd) => new(cmd));
        if(ctx.args['command-name']) {
            const command = commands.find((cmd) => cmd.trigger.toLowerCase() === ctx.args['command-name'].toLowerCase() || cmd.aliases.map((alias) => alias.toLowerCase()).includes(ctx.args['command-name'].toLowerCase()));
            if(!command) return ctx.reply({ embeds: [ getCommandNotFoundEmbed() ] });
            return ctx.reply({ embeds: [ getCommandInfoEmbed(command) ] });
        } else {
            const categories = groupBy(commands, (cmd) => cmd.module);
            const keys = Object.keys(categories);
            const embeds = [];
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
            let msgData = { embeds: [ embeds[index].embed.setDescription(embeds[index].embed.description += `\n**Previous Module**: ${previousModule} ; **Next Module**: ${nextModule}`) ], components: []};
            this.addButton(msgData, "previousButton", "Previous Module", "PRIMARY");
            this.addButton(msgData, "nextButton", "Next Module", "PRIMARY");
            let msg = await ctx.reply(msgData) as Message;
            embeds[index].embed.setDescription(oldDescription);
            const filter = (filterInteraction : Interaction) => {
                if(!filterInteraction.isButton()) return false;
                if(filterInteraction.user.id !== ctx.user.id) return false;
                return true;
            }
            const componentCollector = msg.createMessageComponentCollector({filter: filter, time: 60000});
            componentCollector.on('collect', async collectedButton => {
                let button = collectedButton as ButtonInteraction;
                if(button.customId === "previousButton") {
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
                if(ctx.subject instanceof CommandInteraction) {
                    msg = await (ctx.subject as CommandInteraction).editReply({ embeds: [ embeds[index].embed.setDescription(embeds[index].embed.description += `\n**Previous Module**: ${previousModule} ; **Next Module**: ${nextModule}`) ] }) as Message;
                } else {
                    msg = await msg.edit({ embeds: [ embeds[index].embed.setDescription(embeds[index].embed.description += `\n**Previous Module**: ${previousModule} ; **Next Module**: ${nextModule}`) ] });
                }
                embeds[index].embed.setDescription(oldDescription);
                await button.reply({content: "ㅤ"});
                await button.deleteReply();
            });
            componentCollector.on('end', async () => {
                await msg.reply({ embeds: [ getTimesUpEmbed() ] });
                for(let i = 0; i < msg.components.length; i++) {
                    msg.components[i].components[0].setDisabled(true);
                }
                msgData = { embeds: [...msg.embeds], components: [...msg.components] };
                await msg.edit(msgData);
                return;
            });
        }
    }
}

export default HelpCommand;