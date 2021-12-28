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
        if(!permission) {
            context.reply({ embeds: [ getNoPermissionEmbed() ] });
        } else {
            (new command()).run(context);
        }
    } else if(payload instanceof AutocompleteInteraction) {
        const interaction = payload as AutocompleteInteraction;
        const focusedOption = payload.options.getFocused(true);
        const command = await discordClient.commands.find((cmd) => (new cmd()).trigger === interaction.commandName);
        if(!command) return;
        const focusedArg = (new command()).args.find((arg) => arg.trigger === focusedOption.name);
        if(focusedArg.type === 'RobloxUser') handleRobloxUser(interaction, focusedOption);
        if(focusedArg.type === 'RobloxRole') await handleRobloxRole(interaction, focusedOption);
    }
}

export { handleInteraction };