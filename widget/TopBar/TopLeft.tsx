import { bind } from "astal/binding";
import { Gtk } from "astal/gtk3";
import { Variable } from "astal/variable";
import { Niri } from "../bindings/niri";

const niri = Niri.get_default();

const WorkspaceCircle = ({ focused, isEmpty }: { focused: boolean, isEmpty: boolean }) => {
	const cn = focused ? (
		isEmpty ? "ws-circle-active" : "ws-circle-window-active"
	) : (
		isEmpty ? "ws-circle" : "ws-circle-window"
	);
	return (
		<box className={cn} />
	);
}

const WorkspaceCircles = () => {
	const comps = ([ws, focused]: [Niri.Workspace[], Niri.Workspace | null]) => {
		const isEmpty = (name: string) => !(ws.find(w => w.name === name)?.active_window_id);
		if (!focused || ["one", "two", "three", "four", "five", "six"].includes(focused.name)) {
			return <box
				className="ws-circle-container"
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
			className="ws-text"
			label={focused.name}
		/>
	};
	return Variable.derive([bind(niri, "workspaces"), bind(niri, "focusedWorkspace")])().as(comps);
}

const Clock = () => {
	const time = Variable("").poll(1000, 'date "+%H:%M %b %d %a"');
	return (
		<label
			className={"clock"}
			label={time(String)}
			maxWidthChars={15}
			widthChars={15}
			truncate={true}
		/>
	);
}

const CurrentWindow = () => {
	const comps = ([window]: [Niri.Window | null]) => {
		const windowTitle = (title: string, id: string) => {
			return [
				<label
					halign={Gtk.Align.START}
					label={title}
					maxWidthChars={25}
					truncate={true}
					className="small-text"
				/>,
				<label
					halign={Gtk.Align.START}
					label={id}
					maxWidthChars={20}
					truncate={true}
					className="text"
				/>
			]
		}
		return (
			<box
				vertical={true}
				halign={Gtk.Align.START}
				valign={Gtk.Align.CENTER}
			>
				{window ? windowTitle(window.title, window.app_id) : [(<label
					halign={Gtk.Align.START}
					label=""
					maxWidthChars={20}
					truncate={true}
					className="text"
				/>)]
				}
			</box>
		);
	};
	return Variable.derive([bind(niri, "focusedWindow")])().as(comps);
}

const Logo = () => {
	return (
		<label
			className="clock"
			label=""
		/>
	);
}

export const TopLeft = () => {
	return (
		<box
			spacing={8}
			className="topleft-container"
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


