import {
    ActivityType,
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionAllowedChannelTypes
} from 'discord.js';

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
         * Access to all commands. Please be careful with this.
         */
        all?: string[];
        /**
         * Access to the promote, demote, setrank, and fire commands.
         */
        ranking?: string[];
        /**
         * Access to the info, add-xp, remove-xp, and xp-rankup commands.
         */
        users?: string[];
        /**
         * Access to the shout command.
         */
        shout?: string[];
        /**
         * Access to the join-requests, accept-join, and deny-join commands.
         */
        join?: string[];
        /**
         * Access to the signal command.
         */
        signal?: string[];
        /**
         * Access to the revert-ranks, exile, groupban, and ungroupban command.
         */
        admin?: string[];
    }
    // /**
    //  * Configuration for the built-in database module used by suspension and XP-related commands.
    //  */
    // database: {
    //     /**
    //      * Should the database module be enabled? Disabling this will also disable a few essential commands.
    //      */
    //     enabled: boolean;
    //     /**
    //      * What type of database would you like to use? If it is MongoDB, you need to install mongoose separately.
    //      */
    //     type: 'mongodb' | 'sqlite';
    // }
    /**
     * Should actions be logged, and if so, where?
     */
    logChannels: {
        /**
         * The ID of the channel where you would like all actions done through commands on this bot to be logged.
         */
        actions?: string;
        /**
         * The ID of the channel where you would like all shouts to be logged. Usually, this is a public channel.
         */
        shout?: string;
    }
    /**
     * Should the API be enabled? You are expected to have an environmental variable named API_KEY with a unique password-like string if this is enabled.
    */
    api: boolean;
    /**
     * What rank should be the maximum that can be ranked by your bot? 
    */
    maximumRank: number;
    /**
     * Should users be required to verify through Bloxlink to rank users? This feature will ensure that users cannot rank themselves, users above them, or users with the same rank as them.
     * 
     * **We highly recommend disabling this feature if your server does not use Bloxlink.**
    */
    verificationChecks: boolean;
    /**
     * Required if verificationChecks is provided, which guild is your Bloxlink API Key registered under? Verifications in this guild will be used for all verification checks.
     */
    bloxlinkGuildId?: string;
    /**
     * What rank should users be ranked to when they are fired?
     * @default 1
     */
    firedRank: number;
    /**
     * What role should users be placed at if they are suspended?
     * @default 1
     */
    suspendedRank: number;
    /**
     * Should the user being given xp using add-xp be automatically ranked up if they have the right amount of xp?
     */
    recordManualActions: boolean;
    /**
     * Configuration for the member count feature.
     */
    memberCount: {
        /**
         * Is this feature enabled?
         */
        enabled: boolean;
        /**
         * What channel should the member count be announced in when it changes?
         */
        channelId?: string;
        /**
         * Multiples of this number will be considered milestones.
         */
        milestone?: number;
        /**
         * Should the bot log member counts that are not milestones?
         */
        onlyMilestones?: boolean;
    }
    /**
     * Configuration for the XP system.
     */
    xpSystem: {
        /**
         * Should the XP system be enabled?
         */
        enabled: boolean;
        /**
         * Should users be ranked up if they meet requirements after their XP is changed through commands?
         */
        autoRankup: boolean;
        /**
         * Roles that users can rank up to.
         */
        roles?: {
            /**
             * The rank number of this role.
             */
            rank: number;
            /**
             * The minimum XP that a user needs to rank up to this role.
             * They will always rank up to the one with the highest XP.
             */
            xp: number;
        }[];
    }
    /**
     * Configuration for the anti abuse feature. This works by demoting users who exceed the action threshold within the set amount of time.
     */
    antiAbuse: {
        /**
         * Should the anti abuse feature be enabled?
         */
        enabled: boolean;
        /**
         * How frequently should recorded actions be cleared? This is in seconds, and does not require integers.
         */
         clearDuration?: number;
        /**
         * Within the flushDuration specified above, how many actions can a user have before being demoted due to this anti abuse system?
         */
        threshold?: number;
        /**
         * What rank number should users be demoted to if their actions exceed the 
         */
        demotionRank?: number;
        /**
         * Is there a role that can bypass this? If so, place the ID here.
         */
        bypassRoleId?: string;
    }
    /**
     * Configuration for the bot's activity status (rich presence) on Discord.
     */
    activity: {
        /**
         * Should there be an activity status for the bot?
         */
        enabled: boolean;
        /**
         * What should be displayed before your value?
         */
        type?: ActivityType.Playing | ActivityType.Streaming | ActivityType.Listening | ActivityType.Watching | ActivityType.Competing;
        /**
         * This is the text that is displayed after the type of status.
         */
        value?: string;
        /**
         * If you set the type to STREAMING, where should the watch now button redirect to?
         */
        url?: string;
    }
    /**
     * Configuration for the bot's status (online/idle/dnd).
     */
    status: 'online' | 'idle' | 'dnd';
    /**
     * Should the bot delete URLs in your group wall?
     */
    deleteWallURLs: boolean;
}

export declare type CommandPermission = {
    /**
     * Is this a user or role that this permission is designated for?
     */
    type: 'user' | 'role';
    /**
     * What is the IDs of the user/role in this permission?
     */
    ids: string[];
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
    type: 'Subcommand' | 'SubcommandGroup' | 'String' | 'Number' | 'Boolean' | 'Subcommand' | 'RobloxUser' | 'RobloxRole' | 'DiscordUser' | 'DiscordRole' | 'DiscordChannel' | 'DiscordMentionable';
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
     * Is this argument inputted through a a flag when using the legacy commands system?
     * @default false
     */
    isLegacyFlag?: boolean;
    /**
     * The choices that the user can pick from.
     */
    choices?: ApplicationCommandOptionChoiceData<string>[];
    /**
     * If this is a subcommand (group), command arguments.
     */
    args?: CommandArgument[];
    /**
     * If the type of this argument is set to DiscordChannel, what channel types are allowed?
     */
    channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
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
     * What module should the command be listed under?
     */
    module: string;
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

export declare type BloxlinkResponse = {
    error?: string;
    robloxID: string;
    resolved: any;
}

export declare type DatabaseUser = {
    /**
     * Database-generated UUID for this user. No relevance to the Roblox or Discord IDs; you should ignore this value.
     */
    id: string;
    /**
     * The Roblox ID of the user belonging to this database entry.
     */
    robloxId: string;
    /**
     * How much XP this user has.
     */
    xp: number;
    /**
     * If this user is suspended, when will they be unsuspended?
     */
    suspendedUntil?: Date;
    /**
     * What should they be ranked to once unsuspended?
     */
    unsuspendRank?: number;
    /**
     * Is the user banned from the group?
     */
    isBanned: boolean
}
