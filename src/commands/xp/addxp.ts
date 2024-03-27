import { discordClient, robloxClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getUnexpectedErrorEmbed,
    getVerificationChecksFailedEmbed,
    getSuccessfulXPChangeEmbed,
    getInvalidXPEmbed,
    getSuccessfulAddingAndRankupEmbed,
    getInvalidRobloxGroupEmbed,
    getNoPermissionEmbed,
    getXPSysDisabledEmbed
} from '../../handlers/locale';
import { checkActionEligibility } from '../../handlers/verificationChecks';
import { config } from '../../config';
import { User, PartialUser, GroupMember, Group } from 'bloxy/dist/structures';
import { logAction } from '../../handlers/handleLogging';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { provider } from '../../database';
import { findEligibleRole } from '../../handlers/handleXpRankup';

class AddXPCommand extends Command {
    constructor() {
        super({
            trigger: 'addxp',
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
                {
                    trigger: 'group',
                    description: 'Which group would you like to run this action in?',
                    isLegacyFlag: true,
                    autocomplete: true,
                    required: true,
                    type: 'Group',
                }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.basePermissions.users,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        let robloxGroup: Group;

        const groupConfig = config.groups.find((group) => group.name.toLowerCase() === ctx.args['group'].toLowerCase());
        if(!groupConfig) return ctx.reply({ embeds: [ getInvalidRobloxGroupEmbed() ]});
        if (!groupConfig.xpSystem.enabled) return ctx.reply({ embeds: [ getXPSysDisabledEmbed() ]});
        if(!ctx.checkSecondaryPermissions(groupConfig.permissions, "users")) return ctx.reply({ embeds: [ getNoPermissionEmbed() ] });
        robloxGroup = await robloxClient.getGroup(groupConfig.groupId);

        let enoughForRankUp: boolean;
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
                    const linkedUser = await getLinkedRobloxUser(discordUser.id);
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

        if(config.verificationChecks.enabled) {
            const actionEligibility = await checkActionEligibility(robloxGroup, ctx.user.id, ctx.member.roles.cache.map((r) => r.id), ctx.guild.id, robloxMember, robloxMember.role.rank);
            if(!actionEligibility) return ctx.reply({ embeds: [ getVerificationChecksFailedEmbed() ] });
        }

        const userData = await provider.findXPUser(robloxUser.id.toString(), groupConfig.groupId);
        const xp = Number(userData.xp) + Number(ctx.args['increment']);
        await provider.updateUserXP(robloxUser.id.toString(), groupConfig.groupId, { xp });

        const role = await findEligibleRole(robloxMember, robloxGroup, xp);
        
        if (role) {
            enoughForRankUp = true;
            try {
                await robloxGroup.updateMember(robloxUser.id, role.id);
                ctx.reply({ embeds: [ await getSuccessfulAddingAndRankupEmbed(robloxUser, role.name,xp.toString()) ]});
                logAction(robloxGroup, 'XP Rankup', ctx.user, null, robloxUser, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            } catch (err) {
                console.log(err);
                return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
            }
        } else {
            ctx.reply({ embeds: [ await getSuccessfulXPChangeEmbed(robloxUser, xp) ]});
        }

        try {
            logAction(robloxGroup, 'Add XP', ctx.user, ctx.args['reason'], robloxUser, null, null, null, `${userData.xp} → ${xp} (+${Number(ctx.args['increment'])})`);
        } catch (err) {
            console.log(err);
            return ctx.reply({ embeds: [ getUnexpectedErrorEmbed() ]});
        }
    }
}

export default AddXPCommand;