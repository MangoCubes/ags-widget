import { getter, register } from "ags/gobject";
import { execAsync } from "ags/process";
import GObject from "gi://GObject";
import GLib from "gi://GLib";

const SYNCTHING_URL = "http://127.0.0.1:8384";
const POLL_INTERVAL_MS = 10000;

const curlJson = async (url: string, apiKey: string): Promise<any> => {
	const out = await execAsync(`curl -sf -H "X-API-Key: ${apiKey}" "${url}"`);
	return JSON.parse(out);
};

@register({ GTypeName: "Syncthing" })
export class Syncthing extends GObject.Object {
	static instance: Syncthing;
	static get_default() {
		if (!this.instance) this.instance = new Syncthing();
		return this.instance;
	}

	#apiKey: string | null = null;
	#available = false;
	#connectedDevices = 0;
	#totalDevices = 0;
	#completion = 100;
	#syncing = false;

	@getter(Boolean)
	get available() { return this.#available; }

	@getter(Number)
	get connectedDevices() { return this.#connectedDevices; }

	@getter(Number)
	get totalDevices() { return this.#totalDevices; }

	@getter(Number)
	get completion() { return this.#completion; }

	@getter(Boolean)
	get syncing() { return this.#syncing; }

	async #poll() {
		if (!this.#apiKey) return;

		try {
			const connections = await curlJson(`${SYNCTHING_URL}/rest/system/connections`, this.#apiKey);
			const deviceIds = Object.keys(connections.connections || {});
			this.#totalDevices = deviceIds.length;
			this.#connectedDevices = deviceIds.filter(
				(id: string) => connections.connections[id].connected
			).length;

			const completionData = await curlJson(`${SYNCTHING_URL}/rest/db/completion`, this.#apiKey);
			this.#completion = completionData.completion ?? 100;
			this.#syncing = this.#completion < 100;

			if (!this.#available) {
				this.#available = true;
				this.notify("available");
			}

			this.notify("connected_devices");
			this.notify("total_devices");
			this.notify("completion");
			this.notify("syncing");
		} catch {
			if (this.#available) {
				this.#available = false;
				this.notify("available");
			}
		}
	}

	async #init() {
		try {
			this.#apiKey = await execAsync(`secret-tool lookup Path '/Scripts/ags'`);
		} catch {
			console.log("Syncthing: Could not find API key");
			return;
		}

		await this.#poll();
		GLib.timeout_add(GLib.PRIORITY_DEFAULT, POLL_INTERVAL_MS, () => {
			this.#poll();
			return GLib.SOURCE_CONTINUE;
		});
	}

	constructor() {
		super();
		this.#init();
	}
}
