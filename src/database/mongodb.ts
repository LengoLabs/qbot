import { Schema, connect, model } from 'mongoose';
import { config } from '../config';

const User = model('User', new Schema({
    discordId: String,
    xp: Number,
    suspendedUntil: Date,
}));

class MongoDBProvider {
    constructor() {
        connect(config.database.uri).catch(console.error);
    }

    async findUser(discordId: string) {
        return await User.findOneAndUpdate({ discordId }, { discordId, xp: 0 }, { upsert: true });
    }

    async updateUser(discordId: string, data: any) {
        return await User.updateOne({ discordId }, { discordId, ...data });
    }
}

export { MongoDBProvider };