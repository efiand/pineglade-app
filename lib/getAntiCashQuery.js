import { isDev } from '../constants.js';

export default (dev = isDev) => {
	return dev ? `?${Date.now()}` : '';
};
