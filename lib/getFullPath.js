import { resolve } from 'path';

const __dirname = process.cwd();

export default (fileName) => resolve(__dirname, fileName);
