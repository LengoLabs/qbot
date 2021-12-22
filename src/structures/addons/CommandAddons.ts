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

export class CommandContext  {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    args?: { [key: string]: any };
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

        this.args = {};
        if(payload instanceof Interaction) {
            const interaction = payload as CommandInteraction;
            interaction.deferReply();
            interaction.options.data.forEach(async (arg) => {
                this.args[arg.name] = interaction.options.get(arg.name).value;
            });
        } else {
            this.subject.channel.sendTyping();
            this.command.args.forEach((arg, index) => this.args[arg.trigger] = args.single());
            const filledOutArgCount = Object.keys(Object.fromEntries(Object.entries(this.args).filter(([_, v]) => v !== null))).length;
            const requiredArgCount = this.command.args.filter((arg) => (arg.required === undefined || arg.required === null ? true : arg.required) && !arg.isLegacyFlag).length;
            if(filledOutArgCount < requiredArgCount) {
                this.reply({ embeds: [ getMissingArgumentsEmbed(this.command.trigger, this.command.args) ] });
                throw new Error('INVALID_USAGE');
            } else {
                if(args.length > this.command.args.length) {
                    const extraArgs = args.many(1000, requiredArgCount);
                    this.args[Object.keys(this.args).at(-1)] = [this.args[Object.keys(this.args).at(-1)], ...extraArgs.map((arg) => arg.value)].join(' ');
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
                    if(permission.type === 'role') fitsCriteria = this.member.roles.cache.has(permission.id);
                    if(permission.type === 'user') fitsCriteria = this.member.id === permission.id;
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
        if(this.subject instanceof CommandInteraction) {
            return this.subject.editReply(payload);
        } else {
            return this.subject.channel.send(payload);
        }
    }
}