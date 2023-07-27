import { discordClient } from '../main';
import { CommandContext } from '../structures/addons/CommandAddons';
import {
    Interaction,
    CommandInteraction,
    AutocompleteInteraction,
    ChannelType,
    CacheType,
} from 'discord.js';
import { handleRobloxUser } from '../arguments/handleRobloxUser';
import { handleRobloxRole } from '../arguments/handleRobloxRole';
import { getUnknownCommandMessage, getNoPermissionEmbed } from '../handlers/locale';

const handleInteraction = async (payload: Interaction<CacheType>) => {
    if(payload instanceof CommandInteraction) {
        const interaction = payload as CommandInteraction;
        if(!interaction.channel || !interaction.guild) return interaction.reply({ embeds: [ getUnknownCommandMessage() ] });
        const command = discordClient.commands.find((cmd) => (new cmd()).trigger === interaction.commandName);
        const context = new CommandContext(interaction, command);
        const permission = context.checkPermissions();
        if(!permission) {
            context.reply({ embeds: [ getNoPermissionEmbed() ] });
        } else {
            await context.defer();
            try {
                (new command()).run(context);
            } catch (err) {
                console.log(err);
            }
        }
    } else if(payload instanceof AutocompleteInteraction) {
        const interaction = payload as AutocompleteInteraction;
        if(!interaction.channel || !interaction.guild) return;
        const focusedOption = payload.options.getFocused(true);
        const command = await discordClient.commands.find((cmd) => (new cmd()).trigger === interaction.commandName);
        if(!command) return;
        const focusedArg = (new command()).args.find((arg) => arg.trigger === focusedOption.name);
        if(focusedArg.type === 'RobloxUser') handleRobloxUser(interaction, focusedOption);
        if(focusedArg.type === 'RobloxRole') await handleRobloxRole(interaction, focusedOption);
    }
}

export { handleInteraction };
