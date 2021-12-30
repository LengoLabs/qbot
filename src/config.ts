import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 0,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        all: '',
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
        enabled: false,
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
        autoRankup: false,
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
