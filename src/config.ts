import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 8555157,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        all: '797170424928534548',
        ranking: '797170424928534548',
        users: '797170424928534548',
        shout: '797170424928534548',
        join: '797170424928534548',
        signal: '797170424928534548',
        admin: '797170424928534548',
    },
    logChannels: {
        actions: '925220493290770512',
        shout: '925544846603726918',
    },
    database: {
        enabled: true,
        type: 'mongodb',
        uri: 'mongodb+srv://database:databasepassword@cluster0.13byn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    },
    api: true,
    maximumRank: 255,
    verificationChecks: true,
    firedRank: 1,
    suspendedRank: 1,
    recordManualActions: true,
    memberCount: {
        enabled: false,
        channelId: '',
        milestone: 100,
        onlyMilestones: false,
    },
    xpSystem: {
        enabled: false,
        roles: [
            /* Example:
            {
                rank: 3,
                xp: 30,
            },
            */
        ],
    },
    antiAbuse: {
        enabled: false,
        clearDuration: 1 * 60,
        threshold: 5,
        demotionRank: 1,
        bypassRoleId: '',
    },
    activityStatus: {
        enabled: false,
        type: 'WATCHING',
        value: 'for commands.',
    },
}