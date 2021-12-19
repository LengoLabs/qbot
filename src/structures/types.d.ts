import { ApplicationCommandOptionChoice, ExcludeEnum } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Command } from './Command';

export interface BotConfig {
    /**
     * The ID of the Roblox group this bot will be tied to.
     */
    groupId: number;
    /**
     * Should slash commands be enabled? This is highly recommended, as it provides a way more interactive user experience.
     * 
     * Learn more at https://discord.dev/interactions/application-commands.
     * @default true
     */
    slashCommands: boolean;
    /**
     * Options for legacy (prefixed) commands (e.g. q!promote)
     */
    legacyCommands: {
        /**
         * Should legacy (prefixed) commands be enabled?
         * @default true
         */
        enabled: boolean;
        /**
         * A list of strings that must be appended to messages for commands to be parsed.
         * @default q!
         */
        prefixes: string[];
    }
    /**
     * IDs of roles that have permission to do various things.
     */
    permissions: {
        /**
         * Access to the promote, demote, setrank, and fire commands.
         */
        ranking: string;
    }
    /**
     * Should actions be logged, and if so, where?
     */
    logChannels: {
        /**
         * The ID of the channel where you would like all actions done through commands on this bot to be logged.
         * @default null
         */
        actions: string;
    }
    /**
     * Should users be required to verify through Bloxlink to rank users? This feature will ensure that users cannot rank themselves, users above them, or users with the same rank as them.
     * 
     * **We highly recommend disabling this feature if your server does not use Bloxlink.**
    */
    verificationChecks: boolean;
    /**
     * What rank should users be ranked to when they are fired?
     * @default 1
     */
    firedRank: number;
}

export declare type CommandPermission = {
    /**
     * Is this a user or role that this permission is designated for?
     */
    type: 'user' | 'role';
    /**
     * What is the ID of the user/role?
     */
    id: string;
    /**
     * Is this a positive or negative permission? Remember that the highest applicable permission in the array will be used.
     */
    value?: boolean;
}

export declare type CommandArgument = {
    /**
     * The name of the argument.
     */
    trigger: string;
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
    args?: CommandArgument[];
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
    trigger: string;
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
    args?: CommandArgument[];
}

export declare type CommandExport = {
    default: any;
}

export declare type CommandContextArgument = {
    /**
     * The name of the argument that was used.
     */
    name: string;
    /**
     * The value of the argument that was used.
     */
    value: string;
}

export declare type BloxlinkResponse = {
    status: string;
    primaryAccount?: string;
    matchingAccount?: string;
}