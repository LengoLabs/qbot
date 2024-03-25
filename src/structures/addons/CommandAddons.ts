import {
    Message,
    InteractionReplyOptions,
    CommandInteraction,
    User,
    Guild,
    GuildMember,
    BaseInteraction,
    MessageCreateOptions,
} from 'discord.js';
import { Command } from '../Command';
import { Args } from 'lexure';
import { getMissingArgumentsEmbed } from '../../handlers/locale';
import { config } from '../../config';
import { PermissionsConfig } from '../types';

export class CommandContext {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    args?: { [key: string]: any };
    replied: boolean;
    deferred: boolean;
    command: Command;

    /**
     * Command context for getting usage information and replying.
     * 
     * @param payload
     */
    constructor(payload: BaseInteraction | CommandInteraction | Message, command: any, args?: Args) {
        this.type = payload instanceof Message ? 'message' : 'interaction';
        this.subject = payload instanceof BaseInteraction ? payload as CommandInteraction : payload;
        this.user = payload instanceof Message ? payload.author : payload.user;
        this.member = payload.member as GuildMember;
        this.guild = payload.guild;
        this.command = new command();
        this.replied = false;
        this.deferred = false;
        this.args = {};

        if (payload instanceof BaseInteraction) {
            const interaction = payload as CommandInteraction;

            interaction.options.data.forEach(async (arg) => {
                this.args[arg.name] = interaction.options.get(arg.name).value;
            });
        } else {
            this.subject.channel.sendTyping();
            this.command.args.forEach((arg, index) => { if (!arg.isLegacyFlag) this.args[arg.trigger] = args.single() });

            const filledOutArgs = Object.keys(Object.fromEntries(Object.entries(this.args).filter(([_, v]) => v !== null)));
            const requiredArgs = this.command.args.filter((arg) => (arg.required === undefined || arg.required === null ? true : arg.required) && !arg.isLegacyFlag);

            if (filledOutArgs.length < requiredArgs.length) {
                this.reply({ embeds: [getMissingArgumentsEmbed(this.command.trigger, this.command.args)] });
                throw new Error('INVALID_USAGE');
            } else {
                if (args.length > requiredArgs.length) {
                    const extraArgs = args.many(1000, requiredArgs.length);
                    this.args[Object.keys(this.args).filter((key) => !this.command.args.find((arg) => arg.trigger === key).isLegacyFlag).at(-1)] = [this.args[Object.keys(this.args).filter((key) => !this.command.args.find((arg) => arg.trigger === key).isLegacyFlag).at(-1)], ...extraArgs.map((arg) => arg.value)].join(' ');
                }

                let areAllRequiredFlagsEntered = true;

                this.command.args.filter((arg) => arg.isLegacyFlag).forEach((arg) => {
                    const flagValue = args.option(arg.trigger);
                    if (!flagValue && arg.required) areAllRequiredFlagsEntered = false;
                    this.args[arg.trigger] = flagValue;
                });

                if (!areAllRequiredFlagsEntered) {
                    this.reply({ embeds: [getMissingArgumentsEmbed(this.command.trigger, this.command.args)] });
                    throw new Error('INVALID_USAGE');
                }
            }
        }
    }

    checkSecondaryPermissions(permissionConfig: PermissionsConfig, permissionGroup: string = "admin") {
        let hasPermission = null;

        permissionConfig[permissionGroup].forEach((roleId: string) => {
            if (!hasPermission) {
                const hasGlobalPermission: boolean = config.basePermissions.all && this.member.roles.cache.some((role: any) => config.basePermissions.all.includes(role.id));
                const hasSecGroupPermission: boolean = permissionConfig.all && this.member.roles.cache.some((role: any) => permissionConfig.all.includes(role.id));

                hasPermission = (hasGlobalPermission || hasSecGroupPermission) ? true : this.member.roles.cache.has(roleId);
            }
        });

        return hasPermission || false;
    }

    checkPermissions() {
        if (!this.command.permissions || this.command.permissions.length === 0) {
            return true;
        } else {
            let hasPermission = null;
            let permissions = [];
            this.command.permissions.map((permission) => {
                permission.ids.forEach((id) => {
                    return permissions.push({
                        type: permission.type,
                        id,
                        value: permission.value,
                    });
                });
            });
            const permission = permissions.forEach((permission) => {
                let fitsCriteria: boolean;
                if (!hasPermission) {
                    if (config.basePermissions.all && this.member.roles.cache.some((role) => config.basePermissions.all.includes(role.id))) {
                        fitsCriteria = true;
                    } else {
                        if (permission.type === 'role') fitsCriteria = this.member.roles.cache.has(permission.id);
                        if (permission.type === 'user') fitsCriteria = this.member.id === permission.id;
                    }
                    if (fitsCriteria) hasPermission = true;
                }
            });
            return hasPermission || false;
        }
    }

    /**
     * Send a mesasge in the channel of the command message, or directly reply to a command interaction.
     * 
     * @param payload
     */
    async reply(payload: string | InteractionReplyOptions | MessageCreateOptions | InteractionReplyOptions) {
        this.replied = true;
        if (this.subject instanceof CommandInteraction) {
            try {
                const subject = this.subject as CommandInteraction;
                if (this.deferred) {
                    return await subject.editReply(payload);
                } else {
                    return await subject.reply(payload as InteractionReplyOptions);
                }
            } catch (err) {
                const subject = this.subject as CommandInteraction;
                try {
                    if (this.deferred) {
                        return await subject.editReply(payload as InteractionReplyOptions);
                    } else {
                        return await subject.reply(payload as InteractionReplyOptions);
                    }
                } catch (err) { };
            }
        } else {
            return await this.subject.channel.send(payload as MessageCreateOptions);
        }
    }

    /**
     * Defers a reply.
     */
    async defer() {
        try {
            if (this.subject instanceof CommandInteraction) {
                const interaction = this.subject as CommandInteraction;
                if (!interaction.deferred && !interaction.replied) await this.subject.deferReply();
            } else {
                await this.subject.channel.sendTyping();
            }
            this.deferred = true;
        } catch (err) { };
    }
}
