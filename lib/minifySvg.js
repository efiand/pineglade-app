import { Dest } from '../constants.js';
import { optimize } from 'svgo';
import { svgoConfig } from 'pineglade-config';
import writeFileSmart from './writeFileSmart.js';

export default async (file, fileName = null, dest = Dest.IMAGES) => {
	const { data } = optimize(file, svgoConfig);

	if (fileName) {
		await writeFileSmart(`${dest}/${fileName}`, data);
	}

	return data;
};
