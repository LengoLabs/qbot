import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 8555157,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: [','],
    },
    permissions: {
        all: '797170424928534548',
        ranking: '',
        users: '',
        shout: '',
        join: '',
        signal: '',
        admin: '',
    },
    logChannels: {
        actions: '',
        shout: '',
    },
    database: {
        enabled: true,
        type: 'mongodb',
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
            {
                rank: 253,
                xp: 30,
            },
            
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
