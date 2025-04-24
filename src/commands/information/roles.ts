import { robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { getRoleListEmbed } from '../../handlers/locale';

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder
} from 'discord.js';

class RolesCommand extends Command {
    constructor() {
        super({
            trigger: 'roles',
            description: 'Displays a list of roles on the group.',
            type: 'ChatInput',
            module: 'information',
        });
    }

    async run(ctx: CommandContext) {
        const roles = await robloxGroup.getRoles();
        const embeds = getRoleListEmbed(roles);

        // Set page
        embeds.forEach((embed, index) => {
            embed.setFooter({ text: `Page ${index + 1} of ${embeds.length}` });
        });

        let currentPage = 0;

        const getButtons = () =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === embeds.length - 1)
            );

        const message = await ctx.reply({
            embeds: [embeds[currentPage]],
            components: embeds.length > 1 ? [getButtons()] : []
        });

        if (embeds.length <= 1) return;

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000 // Active for 2 minutes
        });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== ctx.user.id) {
                void interaction.reply({
                    content: 'Only the command creator can scroll.',
                    ephemeral: true
                });
                return;
            }

            if (interaction.customId === 'next' && currentPage < embeds.length - 1) currentPage++;
            else if (interaction.customId === 'prev' && currentPage > 0) currentPage--;

            await interaction.update({
                embeds: [embeds[currentPage]],
                components: [getButtons()]
            });
        });

        collector.on('end', () => {
            message.edit({ components: [] }).catch(() => null);
        });
    }
}

export default RolesCommand;
