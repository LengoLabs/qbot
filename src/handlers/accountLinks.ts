import {robloxClient} from '../main';
import {config} from '../config';
import axios from 'axios';
import verificationProviders from "../structures/verificationProviders";
let requestCount = 0;
let robloxStatus: {
    status: string,
    primaryAccount?: string, // Bloxlink (flagged as optional)
    roblox_id?: number, // Rowifi (flagged as optional)
    robloxId?:number // Rover (flagged as optional)
};

const getLinkedRobloxUser = async (discordId: string, guildId?: string) => {
    if(requestCount >= 60) return null;
    requestCount += 1;
    if(guildId) {
        robloxStatus = (await axios.get(`https://` + verificationProviders[config.verificationAPI.service].URL + verificationProviders[config.verificationAPI.service].endpoints.getUser + `${discordId}?guild=${guildId}`)).data;
    } else {
        robloxStatus = (await axios.get(`https://` + verificationProviders[config.verificationAPI.service].URL + verificationProviders[config.verificationAPI.service].endpoints.getUser)).data;
    }
    if(robloxStatus.status !== 'ok') return null;
    switch (config.verificationAPI.service) {
        case "Bloxlink":
            return await robloxClient.getUser(robloxStatus.primaryAccount);
        case "Rowifi":
            return await robloxClient.getUser(robloxStatus.roblox_id);
        case "Rover":
            return await robloxClient.getUser(robloxStatus.robloxId);
    }

}

const refreshRateLimits = () => {
    requestCount = 0;
    setTimeout(refreshRateLimits, 60000);
}
setTimeout(refreshRateLimits, 60000);

export { getLinkedRobloxUser };
