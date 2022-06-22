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
        robloxStatus = (await axios.get(`https://api.blox.link/v1/user/${discordId}?guild=${guildId}`, { headers: { 'api-key': process.env.BLOXLINK_API_KEY } })).data;
    } else {
        robloxStatus = (await axios.get(`https://api.blox.link/v1/user/${discordId}`, { headers: { 'api-key': process.env.BLOXLINK_API_KEY } })).data;
    }
    if(!robloxStatus.status) return null;
    const robloxUser = await robloxClient.getUser(robloxStatus.user.primaryAccount);
    return robloxUser;
}

const refreshRateLimits = () => {
    requestCount = 0;
    setTimeout(refreshRateLimits, 60000);
}
setTimeout(refreshRateLimits, 60000);

export { getLinkedRobloxUser };