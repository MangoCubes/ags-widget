import GObject, { register, GLib } from "astal/gobject"
import { exec } from "astal/process"
import Gio from "gi://Gio?version=2.0"

const get = (args: string) => exec(`niri msg -j ${args}`);

type Workspace = {
	id: number;
	idx: number;
	name: string;
	output: string;
	is_urgent: boolean;
	is_active: boolean;
	is_focused: boolean;
	active_window_id: number | null;
};

@register({ GTypeName: "Niri" })
export default class Niri extends GObject.Object {
	static instance: Niri
	static get_default() {
		if (!this.instance)
			this.instance = new Niri()

		return this.instance
	}

	#workspaces: Workspace[] = JSON.parse(get("workspaces"));

	#focusedWindow = JSON.parse(get("focused-window"));

	get workspaces() { return this.#workspaces };
	get focusedWindow() { return this.#focusedWindow };

	handle(msg: any) {
		if (msg["Ok"]) return;
		else if (msg["WorkspacesChanged"]) {
			this.#workspaces = msg["WorkspacesChanged"]["workspaces"] as Workspace[];
			this.notify("workspaces");
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
						print(`READ: ${line}`);
						this.handle(JSON.parse(line));
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
