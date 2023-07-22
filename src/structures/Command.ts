import {
    ApplicationCommandOptionData,
} from 'discord.js';
import {
    CommandConfig,
    CommandPermission,
    CommandArgument,
    CommandType,
} from './types';
import { CommandContext } from './addons/CommandAddons';

const commandTypeMappings = {
    ChatInput: 'CHAT_INPUT',
    Message: 'MESSAGE',
    User: 'USER'
}

const argumentTypeMappings = {
    Subcommand: 'SUB_COMMAND',
    SubcommandGroup: 'SUB_COMMAND_GROUP',
    String: 'STRING',
    Number: 'INTEGER',
    RobloxUser: 'STRING',
    RobloxRole: 'STRING',
    DiscordUser: 'USER',
    DiscordRole: 'ROLE',
    DiscordChannel: 'CHANNEL',
    DiscordMentionable: 'MENTIONABLE',
}

const mapArgument = (arg: CommandArgument) => {
    const apiArgument: ApplicationCommandOptionData = {
        name: arg.trigger,
        description: arg.description || 'No description provided.',
        type: argumentTypeMappings[arg.type],
        // @ts-ignore
        autocomplete: arg.autocomplete || false,
        required: arg.required !== null && arg.required !== undefined ? arg.required : true,
        choices: arg.choices || [],
        options: arg.args ? arg.args.map(mapArgument) : [],
        channelTypes: arg.channelTypes,
    }
    return apiArgument;
}

abstract class Command {
    trigger: string;
    type?: CommandType;
    description?: string;
    module?: string;
    aliases?: string[];
    permissions?: CommandPermission[];
    args?: CommandArgument[];

    constructor(options: CommandConfig) {
        this.trigger = options.trigger;
        this.type = options.type || 'ChatInput';
        this.description = options.description || '*No description provided.*';
        this.module = options.module || 'other';
        this.aliases = options.aliases || [];
        this.permissions = options.permissions || [];
        this.args = options.args || [];
    }

    /**
     * Generate a command object for slash commands.
     */
    generateAPICommand() {
        if(this.type.startsWith('Subcommand')) {
            return {
                name: this.trigger,
                description: this.description,
                type: commandTypeMappings[this.type],
                options: this.args ? this.args.map(mapArgument) : [],
            }
        } else {
            return {
                name: this.trigger,
                description: this.description,
                type: commandTypeMappings[this.type],
                options: this.args ? this.args.map(mapArgument) : [],
                defaultPermission: true,
            }
        }
    }

    /**
     * The function to run the command.
     * @param ctx The context of the command.
     * @param args The arguments passed to the command, as an object mapped by ID.
     */
    abstract run(ctx: CommandContext): void;
}

export { Command };