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
    DiscordUser: 'USER',
    DiscordRole: 'ROLE',
    DiscordChannel: 'CHANNEL',
    DiscordMentionable: 'MENTIONABLE',
}

const mapArgument = (arg: CommandArgument) => {
    const apiArgument: ApplicationCommandOptionData = {
        name: arg.name,
        description: arg.description,
        type: argumentTypeMappings[arg.type],
        autocomplete: arg.autocomplete || false,
        required: arg.required || true,
        choices: arg.choices,
        options: arg.arguments.map(mapArgument),
        channelTypes: arg.channelTypes,
    }
    return apiArgument;
}

abstract class Command {
    name: string;
    type?: CommandType;
    description?: string;
    aliases?: string[];
    permissions?: CommandPermission[];
    arguments?: CommandArgument[];

    constructor(options: CommandConfig) {
        this.name = options.name;
        this.type = options.type || 'ChatInput';
        this.description = options.description || '*No description provided.*';
        this.aliases = options.aliases || [];
        this.permissions = options.permissions || [];
        this.arguments = options.arguments || [];
    }

    /**
     * Generate a command object for slash commands.
     */
    generateAPICommand() {
        return {
            name: this.name,
            description: this.description,
            type: commandTypeMappings[this.type],
            options: this.arguments.map(mapArgument),
            defaultPermission: this.permissions.length === 0,
        }
    }

    /**
     * The function to run the command.
     * @param ctx The context of the command.
     * @param args The arguments passed to the command, as an object mapped by ID.
     */
    abstract run(ctx: CommandContext, args: object);
}

export { Command };