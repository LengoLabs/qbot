import { MongoDBProvider } from './mongodb';
import { config } from '../config';

const provider = config.database.enabled ? (config.database.type === 'mongodb' ? MongoDBProvider : null) : null;

export { provider };