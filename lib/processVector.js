import { optimize } from 'svgo';
import { svgoConfig } from 'pineglade-config';
import writeFile from './writeFile.js';

export default async ({ dest, file, fileName }) => {
	const { data } = optimize(file, svgoConfig);
	await writeFile(`${dest}/${fileName}`, data);
};
