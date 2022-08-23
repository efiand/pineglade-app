import { Dest } from '../constants.js';
import { ImagePool } from '@squoosh/lib';
import writeFileSmart from '../lib/writeFileSmart.js';

export default async (file, fileName) => {
	let imagePool = new ImagePool();
	const image = imagePool.ingestImage(file);

	await image.preprocess();
	await image.encode({
		webp: { quality: 75 }
	});

	const encodedImages = Object.values(image.encodedWith);
	if (encodedImages) {
		await Promise.all(
			encodedImages.map(async (encodedImage) => {
				const { binary, extension } = await encodedImage;

				return await writeFileSmart(
					`${Dest.IMAGES}/${fileName}.${extension}`,
					binary
				);
			})
		);
	}

	await imagePool.close();
	imagePool = null;
};
