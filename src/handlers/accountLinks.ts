import { robloxClient } from '../main';
import { BloxlinkResponse } from '../structures/types';
import axios from 'axios';
require('dotenv').config();
let requestCount = 0;

const getLinkedRobloxUser = async (discordId: string, guildId?: string) => {
    if(requestCount >= 60) return null;
    requestCount += 1;
    let robloxStatus: BloxlinkResponse;
    if(guildId) {
        robloxStatus = (await axios.get(`https://v3.blox.link/developer/discord/${discordId}?guild=${guildId}`, { headers: { 'api-key': process.env.BLOXLINK_API_KEY as string } })).data;
    } else {
        robloxStatus = (await axios.get(`https://v3.blox.link/developer/discord/${discordId}`, { headers: { 'api-key': process.env.BLOXLINK_API_KEY as string } })).data;
    }
    console.log(robloxStatus);
    if(!robloxStatus.success) return null;
    const robloxUser = await robloxClient.getUser(robloxStatus.user.primaryAccount);
    return robloxUser;
}

const refreshRateLimits = () => {
    requestCount = 0;
    setTimeout(refreshRateLimits, 60000);
}
setTimeout(refreshRateLimits, 60000);

export { getLinkedRobloxUser };
