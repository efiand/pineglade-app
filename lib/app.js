import { addCssPlugins } from './bundleStyles.js';
import defineTasks from './defineTasks.js';
import getFullPath from './getFullPath.js';
import { isSelf } from '../constants.js';
import log from './log.js';

class App {
	constructor() {
		this.config = {};
		this.tasks = [];
	}

	async configure() {
		if (!isSelf) {
			try {
				this.config = await import(
					`file://${getFullPath('app.config.js')}`
				).then((data) => data.default);
			} catch (err) {
				log.warn('No config found, use internals', 'Pineglade app');
			}
		}

		addCssPlugins(this.config.postcss || {});

		const tasks = defineTasks(this.config);
		Object.keys(tasks).forEach((task) => {
			this[task] = tasks[task];
		});
	}
}

const app = new App();

export default app;
