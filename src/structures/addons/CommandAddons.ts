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
import { CommandContextArgument } from '../types';
import { getMissingArgumentsEmbed, getInvalidRobloxUserEmbed } from '../../handlers/locale';
import { robloxClient } from '../../main';

export class CommandContext  {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    args?: object;
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
            interaction.options.data.forEach(async (arg) => {
                this.args[arg.name] = interaction.options.get(arg.name).value;
            });
        } else {
            command.args.forEach((arg, index) => this.args[arg.trigger] = args.single());
            if(Object.keys(Object.fromEntries(Object.entries(this.args).filter(([_, v]) => v !== null))).length !== command.args.filter((arg) => arg.required === undefined || arg.required === null ? true : arg.required).length) {
                this.reply({ embeds: [ getMissingArgumentsEmbed(command.trigger, command.args) ] });
                throw new Error('INVALID_USAGE');
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
            return this.subject.reply(payload);
        } else {
            // if(Object.keys(payload).includes('ephemeral')) delete payload['ephemeral'];
            return this.subject.channel.send(payload);
        }
    }
}