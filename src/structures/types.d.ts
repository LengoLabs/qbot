import { ApplicationCommandOptionChoice, ExcludeEnum } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Command } from './Command';

export interface BotConfig {
    /**
     * The ID of the Roblox group this bot will be tied to.
     */
    groupId: number;
}

export declare type CommandPermission = {
    /**
     * Is this a user or role that this permission is designated for?
     */
    type: 'user' | 'role';
    /**
     * What is the ID of the user/role?
     */
    id: number;
    /**
     * Is this a positive or negative permission? Remember that the highest applicable permission in the array will be used.
     */
    value?: boolean;
}

export declare type CommandArgument = {
    /**
     * The name of the argument.
     */
    name: string;
    /**
     * The description of the argument. Displayed in the help command and slash command preview.
     */
    description?: string;
    /**
     * How should the value be resolved or what should be prompted for slash commands?
     */
    type?: 'Subcommand' | 'SubcommandGroup' | 'String' | 'Number' | 'Boolean' | 'Subcommand' | 'RobloxUser' | 'DiscordUser' | 'DiscordRole' | 'DiscordChannel' | 'DiscordMentionable';
    /**
     * Should the bot be sent requests to autocomplete everything they type?
     * @default false;
     */
    autocomplete?: boolean;
    /**
     * Is this argument required?
     */
    required?: boolean;
    /**
     * The choices that the user can pick from.
     */
    choices?: ApplicationCommandOptionChoice[];
    /**
     * If this is a subcommand (group), command arguments.
     */
    arguments?: CommandArgument[];
    /**
     * If the type of this argument is set to DiscordChannel, what channel types are allowed?
     */
    channelTypes?: ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[];
}

export declare type CommandType = 'ChatInput' | 'User' | 'Message';

export interface CommandConfig {
    /**
     * The name of the command.
     */
    name: string;
    /**
     * The type of command.
     */
    type?: CommandType;
    /**
     * The description of the command. Displayed in the help command and slash command preview.
     */
    description?: string;
    /**
     * For text commands, what other command names can be used as a substitute of the real name?
     */
    aliases?: string[];
    /**
     * Who should have access to this command? By default, everyone will have access.
     */
    permissions?: CommandPermission[];
    /**
     * What are the command arguments?
     */
    arguments?: CommandArgument[];
}

export declare type CommandExport = {
    default: Command;
}