import express from 'express';
import { config } from './config';
import { provider } from './database/router';
import { logAction } from './handlers/handleLogging';
import { robloxClient, robloxGroup } from './main';
import ms from 'ms';
import { findEligibleRole } from './handlers/handleXpRankup';
const app = express();
require('dotenv').config();

let signals = [];
app.use(express.json());

app.get('/', (req, res) => {
    res.sendStatus(200);
});

const generateSignalId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if(signals.find((signal) => signal.id === result)) return generateSignalId();
    return result;
}

const addSignal = (signal) => {
    signals.push({
        id: generateSignalId(),
        signal,
    });
}

if(config.api) {
    app.use((req, res, next) => {
        if(!req.headers.authorization || req.headers.authorization !== process.env.API_KEY) return res.send({ success: false, msg: 'Unauthorized' });
        next();
    });

    app.get('/user', async (req, res) => {
        const { id } = req.query;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxUser = await robloxClient.getUser(id as string);

            const userData = await provider.findUser(robloxUser.id.toString());
            if(!userData) throw new Error();

            return res.send({
                success: true,
                robloxId: userData.robloxId,
                xp: userData.xp,
                suspendedUntil: userData.suspendedUntil,
                unsuspendRank: userData.unsuspendRank,
                isBanned: userData.isBanned,
            })
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to get information.' });
        }
    });
    
    app.get('/suspensions', async (req, res) => {
        try {
            const suspensions = await provider.findSuspendedUsers();
            if (suspensions.length == 0) return res.send({ success: true, msg: 'No currently suspended users.' });
            const data = JSON.stringify(suspensions);
            return res.send({ success: true, data });
        } catch (e) {
            return res.send({ success: false, msg: 'Failed to get suspensions.' });
        }
    });

    app.get('/join-requests', async (req, res) => {
        try {
            const joinRequests = await robloxGroup.getJoinRequests({ limit: 100 });
            return res.send({
                success: true,
                requests: joinRequests.data,
            })
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to get join requests.' });
        }
    });

    app.get('/signals', async (req, res) => {
        return res.send(signals);
    });

    app.post('/signals/complete', async (req, res) => {
        const { id } = req.query;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const signalIndex = signals.findIndex((signal) => signal.id === id);
            if(signalIndex === -1) throw new Error();
            signals.splice(signalIndex, 1);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to mark signal as completed.' });
        }
    });
    
    app.post('/promote', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();
            const groupRoles = await robloxGroup.getRoles();
            const currentRoleIndex = groupRoles.findIndex((role) => role.rank === robloxMember.role.rank);
            const role = groupRoles[currentRoleIndex + 1];
            if(!role) throw new Error();
            await robloxGroup.updateMember(Number(id), role.id);
            logAction('Promote', 'API Action', robloxMember.name, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/demote', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();
            const groupRoles = await robloxGroup.getRoles();
            const currentRoleIndex = groupRoles.findIndex((role) => role.rank === robloxMember.role.rank);
            const role = groupRoles[currentRoleIndex - 1];
            if(!role) throw new Error();
            await robloxGroup.updateMember(Number(id), role.id);
            logAction('Demote', 'API Action', robloxMember.name, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/fire', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();
            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === config.firedRank);
            if(!role) throw new Error();
            await robloxGroup.updateMember(Number(id), role.id);
            logAction('Fire', 'API Action', null, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/setrank', async (req, res) => {
        const { id, role } = req.body;
        if(!id || !role) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();
            const groupRoles = await robloxGroup.getRoles();
            const newRole = groupRoles.find((r) => Number(role) === r.rank || Number(role) === r.id || String(role).toLowerCase() === r.name.toLowerCase());
            if(!newRole) throw new Error();
            await robloxGroup.updateMember(Number(id), newRole.id);
            logAction('Set Rank', 'API Action', null, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${newRole.name} (${newRole.rank})`);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/suspend', async (req, res) => {
        const { id, duration } = req.body;
        if(!id || !duration) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();

            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === config.suspendedRank);
            if(!role) throw new Error();

            const userData = await provider.findUser(robloxMember.id.toString());
            if(userData.suspendedUntil) throw new Error();
            
            if(robloxMember.role.id !== role.id) {
                await robloxGroup.updateMember(Number(id), role.id);
            }

            const durationInMs = Number(ms(duration));
            if(durationInMs < 0.5 * 60000 && durationInMs > 6.31138519 * (10 ^ 10) ) throw new Error();
            
            const endDate = new Date();
            endDate.setMilliseconds(endDate.getMilliseconds() + durationInMs);

            logAction('Suspend', 'API Action', null, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`, endDate);
            await provider.updateUser(robloxMember.id.toString(), { suspendedUntil: endDate, unsuspendRank: robloxMember.role.id });

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/unsuspend', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();

            const userData = await provider.findUser(robloxMember.id.toString());
            if(!userData.suspendedUntil) throw new Error();
            
            if(robloxMember.role.id !== userData.unsuspendRank) {
                await robloxGroup.updateMember(Number(id), userData.unsuspendRank);
            }

            const groupRoles = await robloxGroup.getRoles();
            const role = groupRoles.find((role) => role.rank === userData.unsuspendRank);
            if(!role) throw new Error();

            logAction('Unsuspend', 'API Action', null, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            await provider.updateUser(robloxMember.id.toString(), { suspendedUntil: null, unsuspendRank: null });

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/xp/add', async (req, res) => {
        const { id, amount } = req.body;
        if(!id || !amount) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();

            const userData = await provider.findUser(robloxMember.id.toString());
            const xp = Number(userData.xp) + Number(amount);

            logAction('Add XP', 'API Action', null, robloxMember, null, null, null, `${userData.xp} → ${xp} (+${Number(amount)})`);
            await provider.updateUser(robloxMember.id.toString(), { xp });

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to add xp.' });
        }
    });

    app.post('/xp/remove', async (req, res) => {
        const { id, amount } = req.body;
        if(!id || !amount) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();

            const userData = await provider.findUser(robloxMember.id.toString());
            const xp = Number(userData.xp) - Number(amount);

            logAction('Remove XP', 'API Action', null, robloxMember, null, null, null, `${userData.xp} → ${xp} (+${Number(amount)})`);
            await provider.updateUser(robloxMember.id.toString(), { xp });

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to remove xp.' });
        }
    });

    app.post('/xp/rankup', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxMember = await robloxGroup.getMember(Number(id));
            if(!robloxMember) throw new Error();

            const groupRoles = await robloxGroup.getRoles();
            const userData = await provider.findUser(robloxMember.id.toString());
            const role = await findEligibleRole(robloxMember, groupRoles, userData.xp);
            if(!role) return res.send({ success: false, msg: 'No rankup available.' });

            await robloxGroup.updateMember(robloxMember.id, role.id);
            logAction('XP Rankup', 'API Action', null, robloxMember, `${robloxMember.role.name} (${robloxMember.role.rank}) → ${role.name} (${role.rank})`);
            
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to rank.' });
        }
    });

    app.post('/shout', async (req, res) => {
        let { content } = req.body;
        if(!content) content = '';
        try {
            await robloxGroup.updateShout(content);
            logAction('Shout', 'API Action', null, null, null, null, content);
            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to shout.' });
        }
    });

    app.post('/join-requests/accept', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxUser = await robloxClient.getUser(id);

            await robloxGroup.acceptJoinRequest(robloxUser.id);
            logAction('Accept Join Request', 'API Action', null, robloxUser);

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to accept join request.' });
        }
    });

    app.post('/join-requests/deny', async (req, res) => {
        const { id } = req.body;
        if(!id) return res.send({ success: false, msg: 'Missing parameters.' });
        try {
            const robloxUser = await robloxClient.getUser(id);
            
            await robloxGroup.declineJoinRequest(robloxUser.id);
            logAction('Deny Join Request', 'API Action', null, robloxUser);

            return res.send({ success: true });
        } catch (err) {
            return res.send({ success: false, msg: 'Failed to deny join request.' });
        }
    });
}

app.listen(process.env.PORT || 3001);
export { addSignal };
