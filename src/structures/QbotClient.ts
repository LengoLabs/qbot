import { Client } from 'discord.js';
import { BotConfig, CommandExport } from './types';
import { Command } from './Command';
import { config } from '../config';
import { readdirSync } from 'fs';

class QbotClient extends Client {
    config: BotConfig;
    commands: Command[];

    constructor() {
        super({
            intents: [
                'GUILDS',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS',
            ]
        });
        this.config = config;
        this.commands = this.loadCommands();
    }

    /**
     * Load all commands into the commands object of QbotClient.
     */
    loadCommands() {
        const rawModules = readdirSync('./src/commands');
        let commands = [];
        rawModules.forEach((module) => {
            const rawCommands = readdirSync(`./src/commands/${module}`);
            rawCommands.forEach(async (cmdName) => {
                const { default: command }: CommandExport = await import(`../commands/${module}/${cmdName}`);
                commands.push(command);
            });
        });
        return commands;
    }
}

export { QbotClient };