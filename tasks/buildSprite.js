import { Dest, isDev } from '../constants.js';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import minifySvg from '../lib/minifySvg.js';
import path from 'path';
import readFileSmart from '../lib/readFileSmart.js';
import writeFileSmart from '../lib/writeFileSmart.js';

const LOG_TITLE = 'Sprite';
const BUNDLE_NAME = 'sprite.bundle.svg';

const getSprite = (
	icons
) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<style>:root&gt;svg{display:none}:root&gt;svg:target{display:block}</style>
${icons.join('\n\n')}
</svg>`;

const createMapper = (files) => (icon, i) => {
	return icon.replace(/^<svg/, `<svg id="${path.basename(files[i], '.svg')}"`);
};

export default async (globs) => {
	log.info('>> Building sprite...', LOG_TITLE);

	const files = await getPathsFromGlobs(globs, false);
	if (!files.length) {
		return;
	}
	const mapIcon = createMapper(files);

	try {
		const icons = await Promise.all(
			files.map(async (file) => await readFileSmart(file))
		).then((results) => results.map(mapIcon));
		const sprite = getSprite(icons);

		if (isDev) {
			await writeFileSmart(`${Dest.IMAGES}/${BUNDLE_NAME}`, sprite);
		} else {
			await minifySvg(sprite, BUNDLE_NAME);
		}

		log.success('<< Sprite successfully builded.', LOG_TITLE);
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};
