import { QbotClient } from './structures/QbotClient';
import { Client as RobloxClient } from 'bloxy';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { recordShout } from './events/shout';
import { checkSuspensions } from './events/suspensions';
import { recordAuditLogs } from './events/audit';
import { recordMemberCount } from './events/member';
import { clearActions } from './handlers/abuseDetection';
import { checkBans } from './events/bans';
import { checkWallForAds } from './events/wall';
import { GroupConfig } from './structures/types';
import { group } from 'console';
require('dotenv').config();

// [Ensure Setup]
if(!process.env.ROBLOX_COOKIE) {
    console.error('ROBLOX_COOKIE is not set in the .env file.');
    process.exit(1);
}

require('./database');
require('./api');

// [Clients]
const robloxClient = new RobloxClient({ credentials: { cookie: process.env.ROBLOX_COOKIE } });
const discordClient = new QbotClient();
const robloxGroupClients = [];
discordClient.login(process.env.DISCORD_TOKEN);

(async () => {
    await robloxClient.login().catch(console.error);
    if(config.antiAbuse.enabled) clearActions();

    config.groups.forEach(async (groupConfig: GroupConfig) => {
        const robloxGroup = await robloxClient.getGroup(groupConfig.groupId);
        robloxGroupClients[Number(groupConfig.groupId)] = robloxGroup;

        if (config.logChannels.shout) recordShout(robloxGroup);
        if (groupConfig.memberCount.enabled) recordMemberCount(robloxGroup, groupConfig);
        if (groupConfig.deleteWallURLs) checkWallForAds(robloxGroup);
        if (groupConfig.recordManualActions) recordAuditLogs(robloxGroup);
        checkBans(robloxGroup);
        checkSuspensions(robloxGroup, groupConfig);
    });
})();

function getClient(groupId: String|null = null) {
    if (groupId == null) return robloxGroupClients;
    return robloxGroupClients[Number(groupId)]
}

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

// [Module]
export { discordClient, robloxClient, getClient };
