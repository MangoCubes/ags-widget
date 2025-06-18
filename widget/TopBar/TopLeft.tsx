import { bind } from "astal/binding";
import { Gtk } from "astal/gtk3";
import { Variable } from "astal/variable";
import { Niri } from "../bindings/niri";

const niri = Niri.get_default();

// const WorkspaceCircle = ({ ws, current }: { ws: Niri.Workspace, current: number }) => {
// 	const cn = ws ? (
// 		ws.id === current ? (
// 			ws.get_clients().length ? "ws-circle-window-active" : "ws-circle-active"
// 		) : (
// 			ws.get_clients().length ? "ws-circle-window" : "ws-circle"
// 		)
// 	) : "ws-circle";
// 	return (
// 		<box className={cn} />
// 	);
// }

// const WorkspaceCircles = () => {
// 	const comps = ([current]: [Niri.Workspace[]]) => {
//
// 		if (current.id >= 1 && current.id <= 10) return (
// 			<box
// 				className="ws-circle-container"
// 				spacing={4}
// 				valign={Gtk.Align.CENTER}
// 			>
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 1) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 2) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 3) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 4) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 5) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 6) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 7) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 8) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 9) as Hyprland.Workspace} />
// 				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 10) as Hyprland.Workspace} />
// 			</box>
// 		);
// 		else return <label
// 			className="ws-text"
// 			label={current.name}
// 		/>
// 	};
// 	return Variable.derive([bind(niri, "workspaces")])().as(comps);
// }

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
			{CurrentWindow()}
			<box />
		</box>
	);
}


// {WorkspaceCircles()}
