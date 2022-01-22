import { DatabaseProvider } from '../structures/DatabaseProvider';
import { DatabaseUser } from '../structures/types';
import { Schema, connect, model } from 'mongoose';
import { config } from '../config';
require('dotenv').config();

const User = model('User', new Schema({
    robloxId: String,
    xp: Number,
    suspendedUntil: Date,
    unsuspendRank: Number,
    isBanned: Boolean
}));

class MongoDBProvider extends DatabaseProvider {
    constructor() {
        super();
        if(config.database.enabled) connect(process.env.DB_URI).catch(console.error);
    }

    rawUserDatabase = User;

    async findUser(robloxId: string): Promise<DatabaseUser> {
        let userData = await User.findOne({ robloxId });
        if(!userData) {
            userData = await User.create({ robloxId, xp: 0, isBanned: false });
        }
        return userData;
    }

    async findSuspendedUsers(): Promise<DatabaseUser[]> {
        return await User.find({ suspendedUntil: { $ne: null } });
    }

    async findBannedUsers(): Promise<DatabaseUser[]> {
        return await User.find({ isBanned: true });
    }

    async updateUser(robloxId: string, data: any) {
        let userData = await User.findOne({ robloxId });
        if(!userData) {
            userData = await User.create({ robloxId, xp: 0, isBanned: false });
        }
        Object.keys(data).forEach((key) => {
            userData[key] = data[key];
        });
        return await userData.save();
    }

    async findTopUsers(): Promise<DatabaseUser[]> {
        const usersWithXP = (await User.find({}).sort({ xp: -1 })).filter(userData => userData.xp > 0);
        const users = [];
        let increment;
        if(usersWithXP.length >= 10) { increment = 10 } else { increment = usersWithXP.length; }
        for(let i = 0; i < increment; i++) {
            users.push(usersWithXP[i]);
        }
        return users;
    }
}

export { MongoDBProvider };
