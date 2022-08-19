import { isCompile } from '../constants.js';
import buildScripts from './buildScripts.js';

export default async () => {
	if (isCompile) {
		await buildScripts();
	}
};
