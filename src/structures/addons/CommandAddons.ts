import {
    Message,
    Interaction,
    MessageOptions,
    InteractionReplyOptions,
    CommandInteraction,
    User,
    Guild,
    GuildMember,
} from 'discord.js';
import { Command } from '../Command';
import { Args } from 'lexure';
import { getMissingArgumentsEmbed, getInvalidRobloxUserEmbed } from '../../handlers/locale';
import { robloxClient } from '../../main';
import { config } from '../../config';

export class CommandContext  {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    args?: { [key: string]: any };
    replied: boolean;
    command: Command;

    /**
     * Command context for getting usage information and replying.
     * 
     * @param payload
     */
    constructor(payload: Interaction | CommandInteraction | Message, command: any, args?: Args) {
        this.type = payload instanceof Message ? 'message' : 'interaction';
        this.subject = payload instanceof Interaction ? payload as CommandInteraction : payload;
        this.user = payload instanceof Message ? payload.author : payload.user;
        this.member = payload.member as GuildMember;
        this.guild = payload.guild;
        this.command = new command();
        this.replied = false;

        this.args = {};
        if(payload instanceof Interaction) {
            const interaction = payload as CommandInteraction;
            setTimeout(() => {
                if(!this.replied) interaction.deferReply();
            }, 500);
            interaction.options.data.forEach(async (arg) => {
                this.args[arg.name] = interaction.options.get(arg.name).value;
            });
        } else {
            this.subject.channel.sendTyping();
            this.command.args.forEach((arg, index) => { if(!arg.isLegacyFlag) this.args[arg.trigger] = args.single() });
            const filledOutArgs = Object.keys(Object.fromEntries(Object.entries(this.args).filter(([_, v]) => v !== null)));
            const requiredArgs = this.command.args.filter((arg) => (arg.required === undefined || arg.required === null ? true : arg.required) && !arg.isLegacyFlag);
            if(filledOutArgs.length < requiredArgs.length) {
                this.reply({ embeds: [ getMissingArgumentsEmbed(this.command.trigger, this.command.args) ] });
                throw new Error('INVALID_USAGE');
            } else {
                if(args.length > requiredArgs.length) {
                    const extraArgs = args.many(1000, requiredArgs.length);
                    this.args[Object.keys(this.args).filter((key) => !this.command.args.find((arg) => arg.trigger === key).isLegacyFlag).at(-1)] = [ this.args[Object.keys(this.args).filter((key) => !this.command.args.find((arg) => arg.trigger === key).isLegacyFlag).at(-1)], ...extraArgs.map((arg) => arg.value)].join(' ');
                }
                let areAllRequiredFlagsEntered = true;
                this.command.args.filter((arg) => arg.isLegacyFlag).forEach((arg) => {
                    const flagValue = args.option(arg.trigger);
                    if(!flagValue && arg.required) areAllRequiredFlagsEntered = false;
                    this.args[arg.trigger] = flagValue;
                });
                if(!areAllRequiredFlagsEntered) {
                    this.reply({ embeds: [ getMissingArgumentsEmbed(this.command.trigger, this.command.args) ] });
                    throw new Error('INVALID_USAGE');
                }
            }
        }
    }

    checkPermissions() {
        if(!this.command.permissions || this.command.permissions.length === 0) {
            return true;
        } else {
            let hasPermission = null;
            const permission = this.command.permissions.forEach((permission) => {
                let fitsCriteria: boolean;
                if(!hasPermission) {
                    if(!permission.value) return;
                    if(config.permissions.all && this.member.roles.cache.has(config.permissions.all)) {
                        fitsCriteria = true;
                    } else {
                        if(permission.type === 'role') fitsCriteria = this.member.roles.cache.has(permission.id);
                        if(permission.type === 'user') fitsCriteria = this.member.id === permission.id;
                    }
                    if(fitsCriteria) hasPermission = true;
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
    reply(payload: string | MessageOptions | InteractionReplyOptions) {
        this.replied = true;
        if(this.subject instanceof CommandInteraction) {
            if(this.subject.deferred) {
                return this.subject.editReply(payload);
            } else {
                return this.subject.reply(payload);
            }
        } else {
            return this.subject.channel.send(payload);
        }
    }
}