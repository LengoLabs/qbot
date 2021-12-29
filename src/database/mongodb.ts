import { DatabaseProvider } from '../structures/DatabaseProvider';
import { DatabaseUser } from '../structures/types';
import { Schema, connect, model } from 'mongoose';
import { config } from '../config';

const User = model('User', new Schema({
    robloxId: String,
    xp: Number,
    suspendedUntil: Date,
    unsuspendRank: Number,
}));

class MongoDBProvider extends DatabaseProvider {
    constructor() {
        super();
        if(config.database.enabled) connect(config.database.uri).catch(console.error);
    }

    async findUser(robloxId: string): Promise<DatabaseUser> {
        let userData = await User.findOne({ robloxId });
        if(!userData) {
            userData = await User.create({ robloxId, xp: 0 });
        }
        return userData;
    }

    async findSuspendedUsers(): Promise<DatabaseUser[]> {
        return await User.find({ suspendedUntil: { $ne: null } });
    }

    async updateUser(robloxId: string, data: any) {
        let userData = await User.findOne({ robloxId });
        if(!userData) {
            userData = await User.create({ robloxId, xp: 0 });
        }
        Object.keys(data).forEach((key) => {
            userData[key] = data[key];
        });
        return await userData.save();
    }
}

export { MongoDBProvider };
