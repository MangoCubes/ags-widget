import { bind } from "astal/binding";
import { Gtk } from "astal/gtk3";
import { Variable } from "astal/variable";
import Hyprland from "gi://AstalHyprland";

const hyprland = Hyprland.get_default();

const WorkspaceCircle = ({ ws, current }: { ws: Hyprland.Workspace, current: number }) => {
	const cn = ws ? (
		ws.id === current ? (
			ws.get_clients().length ? "ws-circle-window-active" : "ws-circle-active"
		) : (
			ws.get_clients().length ? "ws-circle-window" : "ws-circle"
		)
	) : "ws-circle";
	return (
		<box className={cn} />
	);
}

const WorkspaceCircles = () => {
	const comps = ([current, _]: [Hyprland.Workspace, Hyprland.Client[]]) => {
		let ws = hyprland.get_workspaces();
		if (current.id >= 1 && current.id <= 10) return (
			<box
				className="ws-circle-container"
				spacing={4}
				valign={Gtk.Align.CENTER}
			>
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 1) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 2) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 3) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 4) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 5) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 6) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 7) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 8) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 9) as Hyprland.Workspace} />
				<WorkspaceCircle current={current.id} ws={ws.find(w => w.id === 10) as Hyprland.Workspace} />
			</box>
		);
		else return <label
			className="ws-text"
			label={current.name}
		/>
	};
	return Variable.derive([bind(hyprland, "focused_workspace"), bind(hyprland, "clients")])().as(comps);
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
	const comps = ([client]: [Hyprland.Client]) => {
		const windowTitle = ([t, c]: [string, string]) => {
			return [
				<label
					halign={Gtk.Align.START}
					label={t}
					maxWidthChars={25}
					truncate={true}
					className="small-text"
				/>,
				<label
					halign={Gtk.Align.START}
					label={c}
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
				{client ? Variable.derive([bind(client, "title"), bind(client, "class")])().as(windowTitle) : (<label
					halign={Gtk.Align.START}
					label=""
					maxWidthChars={20}
					truncate={true}
					className="text"
				/>)
				}
			</box>
		);
	};
	return Variable.derive([bind(hyprland, "focused_client")])().as(comps);
}

export const TopLeft = () => {
	return (
		<box
			spacing={8}
			className="topleft-container"
			vexpand={false}
		>
			<Clock />
			{WorkspaceCircles()}
			{CurrentWindow()}
			<box />
		</box>
	);
}


//
//     const Workspaces = () => {
//         const content = Utils.merge([
//             hyprland.active.bind("workspace"),
//             hyprland.bind("workspaces")
//         ], (active, ws) => {
//             if (active.id >= 1 && active.id <= 10) {
//                 const valid = ws.map(w => (w.id >= 1 && w.id <= 10 && w.windows > 0) ? w.id - 1 : null);
//                 const hasWindows = [false, false, false, false, false, false, false, false, false, false];
//                 valid.forEach(v => v !== null && (hasWindows[v] = true));
//                 return WorkspaceCircle(active.id, hasWindows);
//             }
//             else return Widget.Label({
//                 class_name: "workspacesText",
//                 label: active.name.toUpperCase()
//             });
//         });
//
//         return Widget.Box({
//             class_name: "invisible",
//             child: content,
//         });
//     }
//
//     const Clock = () => {
//         return Widget.Label({
//             class_name: "clock",
//             label: Variable("", {
//                 poll: [1000, 'date "+%H:%M %b %d"'],
//             }).bind(),
//         });
//     }
//
//     const CurrentWindow = () => Widget.Label({
//         label: hyprland.active.bind("client").as(c => c.title),
//         class_name: "text",
//         widthChars: 20,
//         maxWidthChars: 20,
//         truncate: "end"
//     });
//
//     const TopLeftContent = () => {
//         return Widget.Box({
//             spacing: 10,
//             class_name: "invisible",
//             children: [
//                 Clock(),
//                 // Divider(),
//                 Workspaces(),
//                 CurrentWindow()
//             ]
//         });
//     }
//
//     return Widget.Box({
//         class_name: "barContent",
//         children: [
//             Padding(),
//             TopLeftContent(),
//             Padding(),
//         ]
//     });
// }
