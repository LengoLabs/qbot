import { AutocompleteInteraction, ApplicationCommandOptionChoice } from 'discord.js';
import { robloxGroup } from '../main';

const handleRobloxRole = async (interaction: AutocompleteInteraction, option: ApplicationCommandOptionChoice) => {
    try {
        let allRoles = await robloxGroup.getRoles();
        if(allRoles.length > 25) {
            allRoles = allRoles.slice(0, 25);
        }
        allRoles = allRoles.filter((role) => role.rank !== 0);
        if(!option.value) return interaction.respond(allRoles.map((role) => {
            return {
                name: `${role.name} (${role.rank || 0})`,
                value: role.id.toString()
            }
        }));
        const roles = allRoles.filter((role) => role.name.toLowerCase().includes((option.value as string).toLowerCase()) || role.rank === option.value);
        interaction.respond(roles.map((role) => {
            return {
                name: `${role.name} (${role.rank || 0})`,
                value: role.id.toString()
            }
        }));
    } catch (err) {};
}

export { handleRobloxRole };
