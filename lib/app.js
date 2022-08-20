import * as tasks from '../tasks.js';
import { addCssPlugins } from './bundleStyles.js';
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

		Object.keys(tasks).forEach((task) => {
			this[task] = tasks[task];
		});
	}

	async _getAppConfig() {
		this.config = await setConfig('app.config.js', this.config);
	}
}
