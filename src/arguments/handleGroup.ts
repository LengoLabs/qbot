import { AutocompleteInteraction, APIApplicationCommandOptionChoice } from 'discord.js';
import { config } from '../config';

const handleGroup = async (interaction: AutocompleteInteraction, option: APIApplicationCommandOptionChoice) => {
    let options = config.groups.map((group) => ({
        name: group.name,
        value: group.name,
    }));

    if(option.value) {
        options = options.filter((o) => o.name.toLowerCase().includes((option.value as string).toLowerCase()));
    }

    await interaction.respond(options.slice(0, 25));
}

export { handleGroup };
