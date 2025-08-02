import app from "ags/gtk4/app"
import { TopBar } from "./widget/TopBar";
import scss from "./css/style.scss";
import GObject from "ags/gobject";

export type CallbackList = (() => null | string)[];
export type CallbackTree = { [key: string]: CallbackTree | CallbackList };
export type CallbackComp = () => {
	comp: GObject.Object;
	callbacks: CallbackTree;
};

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
	requestHandler(request: string, res: (response: any) => void) {
		if (request === "show") {
			res(JSON.stringify(cbTree));
			return;
		}
		const getCallbacks = (keys: string) => {
			const keyArray = keys.split(' ');
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
		app.get_monitors().map((a, b) => {
			const { comp, callbacks } = TopBar(b);
			const mergeRes = deepMerge(callbacks, cbTree);
			if (!mergeRes) console.error("Failed to merge callback tree!");
			else cbTree = mergeRes;
			return comp;
		});
	},
})
