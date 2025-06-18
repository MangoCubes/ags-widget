import GObject, { register, GLib, property } from "astal/gobject"
import { exec } from "astal/process"
import Gio from "gi://Gio?version=2.0"

const get = (args: string) => exec(`niri msg -j ${args}`);

export namespace Niri {

	export type Workspace = {
		id: number;
		idx: number;
		name: string;
		output: string;
		is_urgent: boolean;
		is_active: boolean;
		is_focused: boolean;
		active_window_id: number | null;
	};

	export type FocusedWindow = {
		id: number,
		title: string,
		app_id: string,
		pid: number,
		workspace_id: number,
		is_focused: boolean,
		is_floating: boolean,
		is_urgent: boolean
	};

	export type Window = {
		id: number,
		title: string,
		app_id: string,
		pid: number,
		workspace_id: number,
		is_focused: boolean,
		is_floating: boolean,
		is_urgent: boolean,
	};
}

@register({ GTypeName: "Niri" })
export class Niri extends GObject.Object {
	static instance: Niri
	static get_default() {
		if (!this.instance)
			this.instance = new Niri()

		return this.instance
	}

	#workspaces: Niri.Workspace[] = JSON.parse(get("workspaces"));
	#focusedWorkspace: Niri.Workspace | null = null;
	#windows: Niri.Window[] = JSON.parse(get("windows"));
	#focusedWindow: Niri.FocusedWindow | null = JSON.parse(get("focused-window"));

	@property(Object)
	get workspaces() { return this.#workspaces };
	@property(Object)
	get focusedWorkspace() { return this.#focusedWorkspace };
	@property(Object)
	get focusedWindow() { return this.#focusedWindow };
	@property(Object)
	get windows() { return this.#windows };

	handle(msg: any) {
		print(`Received: ${JSON.stringify(msg)}`);
		if (msg["Ok"]) return;
		else if (msg["WorkspacesChanged"]) {
			this.#workspaces = msg["WorkspacesChanged"]["workspaces"] as Niri.Workspace[];
			this.#focusedWorkspace = this.#workspaces.find(w => w.is_active && w.is_focused) ?? null;
			this.notify("workspaces");
			this.notify("focused_workspace");
		} else if (msg["WindowFocusChanged"]) {
			this.#focusedWindow = JSON.parse(get("focused-window"));
			this.notify("focused_window");
		}
	}

	constructor() {
		super()

		const sock = new Gio.UnixSocketAddress({ path: GLib.getenv("NIRI_SOCKET")!! });
		const client = new Gio.SocketClient().connect(sock, null);
		const input = Gio.DataInputStream.new(client.inputStream);
		const output = Gio.DataOutputStream.new(client.outputStream);
		const eventLoop = () => {
			input.read_line_async(GLib.PRIORITY_LOW, null, (stdoutStream, res) => {
				if (!stdoutStream) {
					logError("Event stream is invalid!");
					return;
				}
				try {
					let line = stdoutStream.read_line_finish_utf8(res)[0];

					if (line !== null) {
						this.handle(JSON.parse(line));
						// Yes, this doesn't create stack overflow error
						eventLoop();
					}
				} catch (e) {
					logError(e);
				}
			});
		}
		output.write(`"EventStream"\n`, null);
		eventLoop();
	}
}
