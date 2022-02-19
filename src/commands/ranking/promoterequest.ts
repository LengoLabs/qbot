import { CommandContext } from '../../structures/addons/CommandAddons';
import { discordClient, robloxClient, robloxGroup } from '../../main';
import { Command } from '../../structures/Command';
import { getPromotionRequestEmbed, getRoleListEmbed, getSuccessfulRequestEmbed, getUnexpectedErrorEmbed } from '../../handlers/locale';
import { config } from '../../config';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { TextChannel } from 'discord.js';
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
import { createVoidZero } from 'typescript';



class PromoteRequestCommand extends Command {
    constructor() {
        super({
            trigger: 'pr',
            description: 'Sends a promotion request to an admin for approval',
            type: 'ChatInput',
            module: 'Ranking',
            args: [
                {
                    trigger: 'reason',
                    description: 'Why do you want to be promoted?',
                    autocomplete: false,
                    isLegacyFlag: true,
                    required: true,
                    type: 'String',
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        
       const channel = await discordClient.channels.fetch(config.requestChannel) as TextChannel;
       const id = ctx.member.id;
       const userid = (await getLinkedRobloxUser(ctx.user.id)).id
       const tag = (await discordClient.users.fetch(id)).tag; 
       const reason = ctx.args["reason"];
       const reasonEmbed = getPromotionRequestEmbed(reason, tag)
       await ctx.reply({embeds:[getSuccessfulRequestEmbed()]})
       let msg = await channel.send({
           embeds:[reasonEmbed],
           components: [
               new MessageActionRow()
                   .addComponents([
                       new MessageButton()
                           .setCustomId(`accept-promote-request-for-${ctx.user.id}`)
                           .setLabel('Accept')
                           .setStyle('SUCCESS'),
                       new MessageButton()
                           .setCustomId(`decline-promote-request-for-${ctx.user.id}`)
                           .setLabel('Decline')
                           .setStyle('DANGER')
                   ])
           ]
       });
       const embed = new MessageEmbed()
       let filter = (interaction) => (interaction.customId === `accept-promote-request-for-${ctx.user.id}` || interaction.customId === `decline-promote-request-for-${ctx.user.id}`);
       msg.awaitMessageComponent({ filter }).then(async (collected) => {
           if (!collected) {
               embed.setDescription('Confirmation prompt timed out.');
               return collected.update({ embeds: [embed] });
           }

           if (collected.customId === `decline-promote-request-for-${ctx.user.id}`) {
               ctx.user.send('Your promotion request was declined.')
               embed.setDescription('The request has been declined.');
               return collected.update({ embeds: [embed] });
           }

           if (collected.customId === `accept-promote-request-for-${ctx.user.id}`) {
               embed.setDescription('Accepted.')
               collected.update({ embeds:[embed]})
               try {
               // robloxGroup.updateMember(Number(id), Number((await robloxGroup.getMember(Number(id))).role.id + 1))
               } catch(e) {
                   return collected.update({ embeds:[getUnexpectedErrorEmbed()]})
               }
               ctx.user.send('Your promotion request has been accepted!')
           }
       });

    }
}

export default PromoteRequestCommand;