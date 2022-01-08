import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { discordClient, robloxClient, robloxGroup } from '../../main';

import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';

import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { provider } from '../../database/router';

import { logAction } from '../../handlers/handleLogging';

import { getInvalidRobloxUserEmbed, getRobloxUserIsNotMemberEmbed, getVerificationChecksFailedEmbed, getUnexpectedErrorEmbed, getSuccessfulGroupBanEmbed } from '../../handlers/locale';

import { config } from '../../config';

class GroupBanCommand extends Command {
    constructor() {
        super({
            trigger: "groupban",
            description: "Bans someone from the group",
            type: "ChatInput",
            module: "admin",
            args: [
                {
                    trigger: "roblox-user",
                    description: "Who do you wish to ban from the group?",
                    autocomplete: true,
                    required: true,
                    type: "RobloxUser"
                },
                {
                    trigger: "reason",
                    description: "The reason for why you wish to ban from the group",
                    autocomplete: true,
                    required: false,
                    type: "String"
                }
            ]
        })
    };

    async run(ctx: CommandContext) {
        let robloxUser: User | PartialUser;
        try {
            robloxUser = await robloxClient.getUser(ctx.args['roblox-user'] as number);
        } catch (err) {
            try {
                const robloxUsers = await robloxClient.getUsersByUsernames([ ctx.args['roblox-user'] as string ]);
                if(robloxUsers.length === 0) throw new Error();
                robloxUser = robloxUsers[0];
            } catch (err) {
                try {
                    const idQuery = ctx.args['roblox-user'].replace(/[^0-9]/gm, '');
                    const discordUser = await discordClient.users.fetch(idQuery);
                    const linkedUser = await getLinkedRobloxUser(discordUser.id, ctx.guild.id);
                    if(!linkedUser) throw new Error();
                    robloxUser = linkedUser;
                } catch (err) {
                    return ctx.reply({ embeds: [ getInvalidRobloxUserEmbed() ]});
                }
            }
        }

        let robloxMember: GroupMember;
        try {
            robloxMember = await robloxGroup.getMember(robloxUser.id);
            if(!robloxMember) throw new Error();
        } catch (err) {
            return ctx.reply({ embeds: [ getRobloxUserIsNotMemberEmbed() ]});
        }

        if(config.verificationChecks) {
            const actionEligibility = await checkActionEligibility(ctx.user.id, ctx.guild.id, robloxMember, robloxMember.role.rank);
            if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });
        }

        let rbxId = robloxUser.id;

        try {
            await provider.updateUser(robloxUser.id.toString(), {
                isBanned: true
            });
            await robloxGroup.kickMember(rbxId);
            logAction("Group Ban", ctx.user, ctx.args['reason'], robloxUser);
        } catch(e) {
            console.log(e);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }

        return ctx.reply({ embeds: [ getSuccessfulGroupBanEmbed() ]});
    }
}

export default GroupBanCommand;