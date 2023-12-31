import { AutocompleteInteraction, APIApplicationCommandOptionChoice } from 'discord.js';
import { config } from '../config';

const handleSecondaryGroup = async (interaction: AutocompleteInteraction, option: APIApplicationCommandOptionChoice) => {
    if(!option.value) return;
    await interaction.respond(config.secondaryGroups.map((group) => ({
        name: group.name,
        value: group.name,
    })));
}

export { handleSecondaryGroup };
