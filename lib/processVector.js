import { Dest } from '../constants.js';
import { optimize } from 'svgo';
import { svgoConfig } from 'pineglade-config';
import writeFileSmart from './writeFileSmart.js';

export default async (file, fileName, dest = Dest.IMAGES) => {
	const { data } = optimize(file, svgoConfig);

	if (dest) {
		await writeFileSmart(`${dest}/${fileName}`, data);
	}

	return data;
};
