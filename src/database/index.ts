import { MongoDBProvider } from './mongodb';
import { config } from '../config';

const provider = config.database.enabled ? MongoDBProvider : null;

export { provider };
