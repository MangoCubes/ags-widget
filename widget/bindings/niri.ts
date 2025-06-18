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
	// TODO: Make this an array because there may be 2 monitors
	#focusedWorkspace: Niri.Workspace | null = null;
	#windows: Niri.Window[] = JSON.parse(get("windows"));
	#focusedWindow: Niri.Window | null = JSON.parse(get("focused-window"));

	@property(Object)
	get workspaces() { return this.#workspaces };
	@property(Object)
	get focusedWorkspace() { return this.#focusedWorkspace };
	@property(Object)
	get focusedWindow() { return this.#focusedWindow };
	@property(Object)
	get windows() { return this.#windows };

	updateWorkspaces() {
		this.#workspaces = JSON.parse(get("workspaces"));
		this.#focusedWorkspace = this.#workspaces.find(w => w.is_active && w.is_focused) ?? null;
		this.notify("workspaces");
		// Yes, the notify function must be in snake case
		this.notify("focused_workspace");
	}

	updateWindows() {
		this.#windows = JSON.parse(get("windows"));
		this.#focusedWindow = this.#windows.find(w => w.is_focused) ?? null;
		this.notify("windows");
		this.notify("focused_window");
	}

	handle(msg: any) {
		print(`Received: ${JSON.stringify(msg)}`);
		const key = Object.keys(msg)[0];
		if (key === "Ok") return;
		else if (["WorkspacesChanged", "WorkspaceActivated"].includes(key)) {
			this.updateWorkspaces();
		} else if (["WindowOpenedOrChanged", "WindowFocusChanged"].includes(key)) {
			this.updateWindows();
		} else if (["WorkspaceActiveWindowChanged"].includes(key)) {
			this.updateWorkspaces();
			this.updateWindows();
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
