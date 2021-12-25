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
        connect(config.database.uri).catch(console.error);
    }

    async findUser(robloxId: string): Promise<DatabaseUser> {
        return await User.findOneAndUpdate({ robloxId }, { robloxId, xp: 0 }, { upsert: true });
    }

    async findSuspendedUsers(): Promise<DatabaseUser[]> {
        return await User.find({ suspendedUntil: { $exists: true } });
    }

    async updateUser(robloxId: string, data: any) {
        await User.updateOne({ robloxId }, { robloxId, ...data });
    }
}

export { MongoDBProvider };