import { robloxClient } from '../main';
import { config } from '../config';
import { BloxlinkResponse, RoverResponse, RoWifiResponse } from '../structures/types';
import axios from 'axios';
let requestCount = 0;

const getLinkedRobloxUser = async (discordId: string, guildId?: string) => {
    if(requestCount >= 60) return null;
    requestCount += 1;
    let provider = config.vericationProvider;
    if(provider === "rover") {
        let robloxStatus: RoverResponse;
        robloxStatus = (await axios.get(`https://verify.eryn.io/api/user/${discordId}`)).data;
        if(robloxStatus.status !== "ok") return null;
        const robloxUser = await robloxClient.getUser(robloxStatus.robloxId);
        return robloxUser;
    } else if(provider === "rowifi") {
        let robloxStatus: RoWifiResponse;
        if(guildId) {
            robloxStatus = (await axios.get(`https://api.rowifi.link/v1/users/${discordId}?guild_id=${guildId}`)).data;
        } else {
            robloxStatus = (await axios.get(`https://api.rowifi.link/v1/users/${discordId}`)).data;
        }
        if(robloxStatus.success === false) return null;
        const robloxUser = await robloxClient.getUser(robloxStatus.roblox_id);
        return robloxUser;
    } else {
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
}

const refreshRateLimits = () => {
    requestCount = 0;
    setTimeout(refreshRateLimits, 60000);
}
setTimeout(refreshRateLimits, 60000);

export { getLinkedRobloxUser };