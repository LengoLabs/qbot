import { Message } from 'discord.js';
import { discordClient } from '../main';
import { config } from '../config';
import { CommandContext } from '../structures/addons/CommandAddons';
import { Lexer, Parser, Args, prefixedStrategy } from 'lexure';
import { getNoPermissionEmbed } from '../handlers/locale';

const parseCommand = (s: string): [string, Args] | null => {
    const lexer = new Lexer(s).setQuotes([ ['"', '"'], ['“', '”'] ]);
    const lout = lexer.lexCommand(s => config.legacyCommands.prefixes.some((prefix) => s.startsWith(prefix)) ? 1 : null);
    if(!lout) return null;

    const [command, getTokens] = lout;
    const tokens = getTokens();
    const parser = new Parser(tokens).setUnorderedStrategy(prefixedStrategy(
        ['--', '-', '—'],
        ['=', ':'],
    ));

    const pout = parser.parse();
    return [command.value, new Args(pout)];
}

const handleLegacyCommand = async (message: Message) => {
    if(!config.legacyCommands.enabled) return;
    if(!message.channel || !message.guild) return;
    const out = parseCommand(message.content);
    if(!out) return;
    const commandQuery = out[0] || null;
    const args = out[1] || null;

    const commandName = commandQuery.replace(/[^a-zA-Z0-9]/, '').replace('-', '');
    const command = discordClient.commands.find((cmd) => (new cmd()).trigger === commandName || (new cmd()).aliases.includes(commandName));
    if(!command) return;

    try {
        const context = new CommandContext(message, command, args);
        if(!context.checkPermissions()) {
            context.reply({ embeds: [ getNoPermissionEmbed() ] });
        } else {
            await context.defer();
            try {
                (new command()).run(context);
            } catch (err) {
                console.error(err);
            }
        }
    } catch (err) {
        return;
    }
}

export { handleLegacyCommand };
