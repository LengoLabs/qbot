import { MongoDBProvider } from './mongodb';
import { SQLiteProvider } from './sqlite';
import { config } from '../config';

const provider = config.database.enabled ? (config.database.type === 'mongodb' ? MongoDBProvider : SQLiteProvider) : null;

export { provider };