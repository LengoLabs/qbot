import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getUnexpectedErrorEmbed,
    getNoRankAboveEmbed,
    getRoleNotFoundEmbed,
    getVerificationChecksFailedEmbed,
    getSuccessfulXPChangeEmbed,
    getInvalidXPEmbed,
} from '../../handlers/locale';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { provider } from '../../database/router';

class AddXPCommand extends Command {
    constructor() {
        super({
            trigger: 'add-xp',
            description: 'Adds XP to a user.',
            type: 'ChatInput',
            module: 'xp',
            args: [
                {
                    trigger: 'roblox-user',
                    description: 'Who do you want to add XP to?',
                    autocomplete: true,
                    type: 'RobloxUser',
                },
                {
                    trigger: 'increment',
                    description: 'How much XP would you like to add?',
                    type: 'Number',
                },
                {
                    trigger: 'reason',
                    description: 'If you would like a reason to be supplied in the logs, put it here.',
                    isLegacyFlag: true,
                    required: false,
                    type: 'String',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    id: config.permissions.users,
                    value: true,
                }
            ]
        });
    }

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

        if(!Number.isInteger(Number(ctx.args['increment'])) || Number(ctx.args['increment']) < 0) return ctx.reply({ embeds: [ getInvalidXPEmbed() ] });

        const groupRoles = await robloxGroup.getRoles();
        const role = groupRoles.find((role) => role.rank === robloxMember.role.rank + 1);
        if(!role) return ctx.reply({ embeds: [ getNoRankAboveEmbed() ]});
        if(role.rank > config.maximumRank || robloxMember.role.rank > config.maximumRank) return ctx.reply({ embeds: [ getRoleNotFoundEmbed() ] });

        const actionEligibility = await checkActionEligibility(ctx.user.id, ctx.guild.id, robloxMember, role.rank);
        if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });

        const userData = await provider.findUser(robloxUser.id.toString());
        const xp = Number(userData.xp) + Number(ctx.args['increment']);
        await provider.updateUser(robloxUser.id.toString(), { xp });

        try {
            ctx.reply({ embeds: [ await getSuccessfulXPChangeEmbed(robloxUser, xp) ]});
            logAction('Add XP', ctx.user, ctx.args['reason'], robloxUser, null, null, null, `${userData.xp} → ${xp} (+${Number(ctx.args['increment'])})`);
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default AddXPCommand;