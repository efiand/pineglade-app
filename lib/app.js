import { addCssPlugins } from './bundleStyles.js';
import defineTasks from './defineTasks.js';
import setConfig from './setConfig.js';
import { setupEslint } from './lintScripts.js';
import { setupStylelint } from './lintStyles.js';

export default class App {
	constructor() {
		this.config = {};
		this.tasks = [];
	}

	async configure() {
		await Promise.all([this._getAppConfig(), setupEslint(), setupStylelint()]);

		addCssPlugins(this.config.postcss || {});

		const tasks = defineTasks(this.config);
		Object.keys(tasks).forEach((task) => {
			this[task] = tasks[task];
		});
	}

	async _getAppConfig() {
		this.config = await setConfig('app.config.js', this.config);
	}
}
