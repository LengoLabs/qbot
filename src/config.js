module.exports = {
    groupId: 0,
    maximumRank: 0,
    prefix: 'q!',
    logChannelId: '',
    shoutChannelId: '',
    auditLogChannelId: '',
    legacyCommands: true,
    colors: {
        info: '#5b57d9',
        error: '#de554e',
        neutral: '#f2f255',
        success: '#43d177'
    },
    verificationChecks: false,
    firedRank: 1,
    xpRankup: {
        enabled: false,
        roles: [
            // Example: {
            //     rank: 2,
            //     xpNeeded: 10
            // }
        ]
    },
    memberCount: {
        enabled: false,
        groupIconURL: '',
        channelId: '',
        milestones: []
    },
    antiAbuse: {
        enabled: false,
        bypassRank: 255,
        duration: 120,
        threshold: 5,
        actionRank: null,
        actionLogChannelId: ''
    },
    updateSettings: {
        exclusions: ["src/config.js", "package.json"]
    }
}