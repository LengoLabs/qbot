import { robloxClient } from '../main';
import { BloxlinkResponse } from '../structures/types';
import axios from 'axios';
let requestCount = 0;

const getLinkedRobloxUser = async (discordId: string, guildId?: string) => {
    if(requestCount >= 60) return null;
    requestCount += 1;
    let robloxStatus: BloxlinkResponse;
    if(guildId) {
        robloxStatus = (await axios.get(`https://api.blox.link/v1/user/${discordId}?guild=${guildId}`)).data;
    } else {
        robloxStatus = (await axios.get(`https://api.blox.link/v1/user/${discordId}`)).data;
    }
    if(robloxStatus.status !== 'ok') return null;
    const robloxUser = await robloxClient.getUser(robloxStatus.primaryAccount);
    return robloxUser;
}

const refreshRateLimits = () => {
    requestCount = 0;
    setTimeout(refreshRateLimits, 60000);
}
setTimeout(refreshRateLimits, 60000);

export { getLinkedRobloxUser };