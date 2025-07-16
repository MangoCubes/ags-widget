import Gtk from "gi://Gtk";
import { Niri } from "../bindings/niri";
import { createPoll } from "ags/time";
import { Accessor, createBinding, createComputed, With } from "ags";
import Pango from "gi://Pango";

const niri = Niri.get_default();

const WorkspaceCircle = ({ focused, windowCount }: { focused: boolean, windowCount: number }) => {
	return <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER} vexpand>
		<box class={focused ? "ws-top-block-focused" : "ws-top-block"} />
		<label vexpand label={windowCount > 9 ? "+" : windowCount.toString()} class="small-text" justify={Gtk.Justification.RIGHT} />
		<box class={windowCount ? (focused ? "ws-block-window-focused" : "ws-block-window") : (focused ? "ws-block-focused" : "ws-block")} />
	</box>
}

const WorkspaceCircles = () => {
	const wss = createBinding(niri, "workspaces");
	const ws = createBinding(niri, "focusedWorkspace");
	const windows = createBinding(niri, "windows");
	const wsInfo: Accessor<[Niri.Workspace[], Niri.Workspace | null, Niri.Window[]]> = createComputed([wss, ws, windows], (wss, ws, windows) => [wss, ws, windows]);
	return <box><With value={wsInfo}>{([ws, focused, windows]: [Niri.Workspace[], Niri.Workspace | null, Niri.Window[]]) => {
		const getWindowCount = (name: string) => {
			const workspace = ws.find(w => w.name === name);
			if (!workspace) return 0;
			return windows.filter(wd => wd.workspace_id === workspace.id).length;
		}
		if (!focused || ["one", "two", "three", "four", "five", "six"].includes(focused.name)) {
			return <box
				vexpand
			>
				<WorkspaceCircle focused={focused !== null && focused.name === "one"} windowCount={getWindowCount("one")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "two"} windowCount={getWindowCount("two")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "three"} windowCount={getWindowCount("three")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "four"} windowCount={getWindowCount("four")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "five"} windowCount={getWindowCount("five")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "six"} windowCount={getWindowCount("six")} />
			</box>
		} else return <label
			class="ws-text"
			label={focused.name}
		/>

	}}</With></box>
}

const Clock = () => {
	const time = createPoll('', 1000, 'date "+%H:%M %b %d %a"');
	return (
		<label
			class="text"
			label={time(String)}
			maxWidthChars={14}
			widthChars={14}
		/>
	);
}

const CurrentWindow = () => {
	const w = createBinding(niri, "focusedWindow");
	return <box
	><With value={w}>{(w) => {
		const windowTitle = (title: string, id: string) => {
			return (<box
				homogeneous
				halign={Gtk.Align.FILL}
				orientation={Gtk.Orientation.VERTICAL}>
				<box>
					<label
						halign={Gtk.Align.START}
						label={title}
						justify={Gtk.Justification.LEFT}
						maxWidthChars={20}
						ellipsize={Pango.EllipsizeMode.END}
						class="small-text"
					/>
				</box>
				<box>
					<label
						halign={Gtk.Align.START}
						label={id}
						justify={Gtk.Justification.LEFT}
						maxWidthChars={15}
						vexpand
						ellipsize={Pango.EllipsizeMode.END}
						class="text"
					/>
				</box>
			</box>);
		}
		return (
			<box
				halign={Gtk.Align.START}
				valign={Gtk.Align.CENTER}
				css="min-width: 200px;"
			>
				{w ? windowTitle(w.title, w.app_id) : [(<label
					halign={Gtk.Align.START}
					label=""
					maxWidthChars={20}
					class="text"
				/>)]
				}
			</box>
		);

	}}</With></box>
}

const Logo = () => {
	return (
		<label
			class="text"
			label=" "
		/>
	);
}

export const TopLeft = () => {
	return (
		<box
			spacing={8}
			class="topleft-container"
		>
			<Logo />
			<Clock />
			{WorkspaceCircles()}
			{CurrentWindow()}
			<box />
		</box>
	);
}


