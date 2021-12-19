import { discordClient } from '../main';
import { CommandContext } from '../structures/addons/CommandAddons';
import {
    Interaction,
    CommandInteraction,
    CommandInteractionOption,
    AutocompleteInteraction,
} from 'discord.js';
import { handleRobloxUser } from '../arguments/handleRobloxUser';
import { handleRobloxRole } from '../arguments/handleRobloxRole';
import { getNoPermissionEmbed } from '../handlers/locale';

const handleInteraction = async (payload: Interaction) => {
    if(payload instanceof CommandInteraction) {
        const interaction = payload as CommandInteraction;
        const command = discordClient.commands.find((cmd) => (new cmd()).trigger === interaction.commandName);
        const context = new CommandContext(interaction, command);
        const permission = context.checkPermissions();
        console.log(permission);
        if(!permission) {
            context.reply({ embeds: [ getNoPermissionEmbed() ] });
        } else {
            (new command()).run(context);
        }
    } else if(payload instanceof AutocompleteInteraction) {
        const interaction = payload as AutocompleteInteraction;
        const focusedOption = payload.options.getFocused(true);
        if(focusedOption.name === 'roblox-user') handleRobloxUser(interaction, focusedOption);
        if(focusedOption.name === 'roblox-role') await handleRobloxRole(interaction, focusedOption);
    }
}

export { handleInteraction };