const fetch = require('node-fetch');
let verificationCheckRequests = 0;

module.exports = {
    getLinkedUser: async (id, guildId) => {
        if(verificationCheckRequests > 20) return 'RATE_LIMITS';
        let bloxlinkResponse = await fetch(`https://api.blox.link/v1/user/${id}?guild=${guildId}`).catch(async (err) => {
            return null;
        });
        let bloxlinkJSON = await bloxlinkResponse.json().catch(async (err) => {
            return null;
        });
        verificationCheckRequests += 1;
        if(bloxlinkJSON.status === 'ok') {
            return bloxlinkJSON.primaryAccount;
        } else {
            let roverResponse = await fetch(`https://verify.eryn.io/api/user/${id}`).catch(async (err) => {
                return null;
            });
            let roverJSON = await roverResponse.json().catch(async (err) => {
                return null;
            });
            verificationCheckRequests += 1;
            if(roverJSON.status === 'ok') {
                return roverJSON.robloxId;
            } else {
                return null;
            }
        }
    },
    getGroup: async (groupId) => {
        let groupInfo = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
        let groupJSON = await groupInfo.json();
        return groupJSON;
    },
    getUser: async (id) => {
        let userInfo = await fetch(`https://api.roblox.com/users/${id}`);
        let userJSON = await userInfo.json();
        return userJSON;
    }
}

let resetVerificationCheckRequests = () => {
    verificationCheckRequests = 0;
    setTimeout(resetVerificationCheckRequests, 60000);
}
setTimeout(resetVerificationCheckRequests, 60000);
