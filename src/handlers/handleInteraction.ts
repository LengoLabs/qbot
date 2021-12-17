import { discordClient } from '../main';
import { CommandContext } from '../structures/addons/CommandAddons';
import {
    Interaction,
    CommandInteraction,
    ButtonInteraction,
    SelectMenuInteraction,
} from 'discord.js';

const handleInteraction = (anyInteraction: Interaction) => {
    if(anyInteraction instanceof CommandInteraction) {
        const interaction = anyInteraction as CommandInteraction;
        const command = discordClient.commands.find((cmd) => cmd.name === interaction.commandName);
        const context = new CommandContext(interaction);
        command.run(context, {});
    }
}

export { handleInteraction };