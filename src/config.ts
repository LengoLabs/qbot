import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 3281575,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        all: ['792147377209344000'],
        ranking: [''],
        users: [''],
        shout: [''],
        join: [''],
        signal: [''],
        admin: [''],
    },
    logChannels: {
        actions: '',
        shout: '',
    },
    database: {
        enabled: true,
        type: 'mongodb',
    },
    api: false,
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
    activity: {
        enabled: false,
        type: 'WATCHING',
        value: 'for commands.',
    },
    status: 'online',
    deleteWallURLs: false,
}
