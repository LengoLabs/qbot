import { robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { getRoleListEmbed } from '../../handlers/locale';

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
        try {
            const roles = await robloxGroup.getRoles();

            if (roles.length === 0) {
                return ctx.reply({ content: 'No roles found in the group.', ephemeral: true });
            }

            const embeds = [];
            const chunkSize = 25;
            const firstChunk = roles.slice(0, chunkSize);
            const firstEmbed = getRoleListEmbed(firstChunk);
            embeds.push(firstEmbed);

            for (let i = chunkSize; i < roles.length; i += chunkSize) {
                const rolesChunk = roles.slice(i, i + chunkSize);
                const embed = getRoleListEmbed(rolesChunk);

                embed.setTitle(null); 
                embed.setDescription(null); 

                embeds.push(embed);
            }

            // Send the embeds in reply
            for (const embed of embeds) {
                await ctx.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            return ctx.reply({ content: 'An error occurred while fetching the roles. Please contact ZADMIN support', ephemeral: true });
        }
    }
}

export default RolesCommand;
