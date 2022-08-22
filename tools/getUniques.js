import ensureArray from './ensureArray.js';

export default (payload, flat = true) => {
	const arr = ensureArray(payload);
	return Array.from(new Set(flat ? arr.flat(Infinity) : arr));
};
