import Gtk from "gi://Gtk";
import { Niri } from "../bindings/niri";
import { createPoll } from "ags/time";
import { Accessor, createBinding, createComputed, With } from "ags";
import Pango from "gi://Pango";

const niri = Niri.get_default();

const WorkspaceCircle = ({ focused, isEmpty }: { focused: boolean, isEmpty: boolean }) => {
	const cn = focused ? (
		isEmpty ? "ws-circle-active" : "ws-circle-window-active"
	) : (
		isEmpty ? "ws-circle" : "ws-circle-window"
	);
	return (
		<box class={cn} />
	);
}

const WorkspaceCircles = () => {
	const wss = createBinding(niri, "workspaces");
	const ws = createBinding(niri, "focusedWorkspace");
	const wsInfo: Accessor<[Niri.Workspace[], Niri.Workspace | null]> = createComputed([wss, ws], (wss, ws) => [wss, ws]);
	return <box><With value={wsInfo}>{([ws, focused]: [Niri.Workspace[], Niri.Workspace | null]) => {
		const isEmpty = (name: string) => !(ws.find(w => w.name === name)?.active_window_id);
		if (!focused || ["one", "two", "three", "four", "five", "six"].includes(focused.name)) {
			return <box
				class="ws-circle-container"
				spacing={4}
				valign={Gtk.Align.CENTER}
			>
				<WorkspaceCircle focused={focused !== null && focused.name === "one"} isEmpty={isEmpty("one")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "two"} isEmpty={isEmpty("two")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "three"} isEmpty={isEmpty("three")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "four"} isEmpty={isEmpty("four")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "five"} isEmpty={isEmpty("five")} />
				<WorkspaceCircle focused={focused !== null && focused.name === "six"} isEmpty={isEmpty("six")} />
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
			class={"clock"}
			label={time(String)}
			maxWidthChars={14}
			widthChars={14}
		/>
	);
}

const CurrentWindow = () => {
	const w = createBinding(niri, "focusedWindow");
	return <box><With value={w}>{(w) => {
		const windowTitle = (title: string, id: string) => {
			return (<box
				orientation={Gtk.Orientation.VERTICAL}>
				<box halign={Gtk.Align.CENTER}>
					<label
						halign={Gtk.Align.START}
						label={title}
						maxWidthChars={25}
						widthChars={25}
						ellipsize={Pango.EllipsizeMode.END}
						class="small-text"
					/>
				</box>
				<box halign={Gtk.Align.CENTER}>
					<label
						halign={Gtk.Align.START}
						label={id}
						maxWidthChars={20}
						widthChars={20}
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
			class="clock"
			label=" "
		/>
	);
}

export const TopLeft = () => {
	return (
		<box
			spacing={8}
			class="topleft-container"
			vexpand={false}
		>
			<Logo />
			<Clock />
			{WorkspaceCircles()}
			{CurrentWindow()}
			<box />
		</box>
	);
}


