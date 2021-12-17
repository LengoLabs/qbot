import { QbotClient } from './structures/QbotClient';
import { Client, Client as RobloxClient } from 'bloxy';
import { handleInteraction } from './handlers/handleInteraction';
import { config } from './config'; 
require('dotenv').config();

// [Clients]
const discordClient = new QbotClient();
discordClient.loadCommands();
discordClient.login(process.env.token);
const robloxClient = new RobloxClient({ credentials: { cookie: process.env.ROBLOX_COOKIE } });

// [Handlers]
discordClient.on('interactionCreate', handleInteraction);

// [Module]
export { discordClient, robloxClient };