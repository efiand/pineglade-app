import { basename, extname } from 'path';
import processSquoosh from './processSquoosh.js';
import { readFile } from 'fs/promises';

export default async ({ entry, dest }) => {
	const fileName = basename(entry, extname(entry));
	const file = await readFile(entry);

	await processSquoosh({ dest, file, fileName });
};
