import { QbotClient } from './structures/QbotClient';
import { Client, Client as RobloxClient } from 'bloxy';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { recordShout } from './loggers/shout';
require('dotenv').config();

// [Clients]
const discordClient = new QbotClient();
discordClient.login(process.env.token);
const robloxClient = new RobloxClient({ credentials: { cookie: process.env.ROBLOX_COOKIE } });
let robloxGroup: Group = null;
(async () => {
    await robloxClient.login().catch(console.error);
    robloxGroup = await robloxClient.getGroup(config.groupId);
    
    // [Loggers]
    recordShout();
})();

// [Handlers]
discordClient.on('interactionCreate', handleInteraction);
discordClient.on('messageCreate', handleLegacyCommand);

// [Module]
export { discordClient, robloxClient, robloxGroup };