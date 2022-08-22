import BuilderApp from './app/BuilderApp.js';
import LinterApp from './app/LinterApp.js';
import WatcherApp from './app/WatcherApp.js';
import { script } from './constants.js';

const appByScript = {
	builder: BuilderApp,
	linter: LinterApp,
	watcher: WatcherApp
};

(async () => {
	const app = new appByScript[script]();

	await app.run();
})();
