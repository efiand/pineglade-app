import { ImagePool } from '@squoosh/lib';
import writeFile from './writeFile.js';

const encodeOptions = {
	mozjpeg: { progressive: true, quality: 75 }
};

export default async ({ dest, file, fileName }) => {
	let imagePool = new ImagePool();
	const image = imagePool.ingestImage(file);

	await image.preprocess();
	await image.encode(encodeOptions);

	const encodedImages = Object.values(image.encodedWith);
	if (encodedImages) {
		await Promise.all(
			encodedImages.map(async (encodedImage) => {
				const { binary, extension } = await encodedImage;

				return await writeFile(`${dest}/${fileName}.${extension}`, binary);
			})
		);
	}

	await imagePool.close();
	imagePool = null;
};
