import { DatabaseProvider } from '../structures/DatabaseProvider';
import { MongoDBProvider } from './mongodb';
import { SQLiteProvider } from './sqlite';
import { config } from '../config';

let provider: MongoDBProvider | SQLiteProvider;
if(config.database.enabled) {
    if(config.database.type === 'mongodb') {
        provider = new MongoDBProvider();
    } else {
        provider = new SQLiteProvider();
    }
}

export { provider };