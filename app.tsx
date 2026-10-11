import app from "ags/gtk4/app"
import { TopBar } from "./widget/TopBar";
import scss from "./css/style.scss";
import GObject from "ags/gobject";
import { Gdk, Gtk } from "ags/gtk4";
import { createRoot, onCleanup } from "ags";

export type CallbackList = (() => null | string)[];
export type CallbackTree = { [key: string]: CallbackTree | CallbackList };
export type CallbackComp = () => {
	comp: GObject.Object;
	callbacks: CallbackTree;
};

type Bar = ReturnType<typeof TopBar> & { monitor: Gdk.Monitor; dispose: () => void };

let cbTree: CallbackTree = {};

const deepMerge = (newTree: CallbackTree, oldTree: CallbackTree): CallbackTree | null => {
	const merged: CallbackTree = {};
	for (const key in newTree) {
		const newObj = newTree[key];
		const oldObj = oldTree[key];
		if (!oldObj) merged[key] = newObj;
		else if (!newObj) merged[key] = oldObj;
		else if (Array.isArray(newObj) && Array.isArray(oldObj)) {
			merged[key] = [...oldObj, ...newObj];
		} else if (newObj && oldObj && !Array.isArray(newObj) && !Array.isArray(oldObj)) {
			const res = deepMerge(newObj, oldObj);
			if (!res) return null;
			merged[key] = res;
		} else {
			console.error(newObj);
			console.error(oldObj);
			return null;
		}
	}
	return merged;
};

app.start({
	css: scss,
	requestHandler(request, res) {
		if (request[0] === "show") {
			res(JSON.stringify(cbTree));
			return;
		}
		const getCallbacks = (keys: string[]) => {
			const keyArray = keys[0].split(' ');
			let currentNode: CallbackTree | CallbackList = cbTree;
			for (const key of keyArray) {
				if (currentNode && key in currentNode && !(Array.isArray(currentNode)))
					currentNode = currentNode[key];
				else return null;
			}

			if (Array.isArray(currentNode)) return currentNode;
			else return null;

		}
		const cbs = getCallbacks(request);
		if (cbs) {
			let printed = false;
			cbs.forEach(cb => {
				const msg = cb();
				if (msg) {
					printed = true;
					res(msg);
				}
			});
			if (!printed) res("Done.");
		}
		else return res("Unknown command.");
	},
	main() {
		let bars: Bar[] = [];
		const createBar = (monitor: Gdk.Monitor): Bar => createRoot((dispose) => ({
			monitor, dispose, ...TopBar(monitor),
		}));
		const destroyBar = (bar: Bar) => {
			if (bar.comp instanceof Gtk.Window) bar.comp.destroy();
			bar.dispose();
		};
		const syncBars = () => {
			const monitors = app.get_monitors();
			bars.filter(({ monitor }) => !monitors.includes(monitor)).forEach(destroyBar);
			const connected = bars.filter(({ monitor }) => monitors.includes(monitor));
			bars = connected.concat(monitors
				.filter((monitor) => !connected.some((bar) => bar.monitor === monitor))
				.map(createBar));
			const callbacks = bars.reduce<CallbackTree | null>(
				(tree, bar) => tree && deepMerge(bar.callbacks, tree), {}
			);
			if (callbacks) cbTree = callbacks;
			else console.error("Failed to merge callback tree!");
		};
		const monitorHandler = app.connect("notify::monitors", syncBars);
		syncBars();
		onCleanup(() => {
			app.disconnect(monitorHandler);
			bars.forEach(destroyBar);
			cbTree = {};
		});
	},
})
