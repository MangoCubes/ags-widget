import { App, Astal, Gdk } from "astal/gtk3"
import { TopLeft } from "./TopBar/TopLeft"
import { TopRight } from "./TopBar/TopRight"
import { TopCentre } from "./TopBar/TopCentre"

export const TopBar = (gdkmonitor: Gdk.Monitor) => {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

	return (
		<window
			className="window-bar-container"
			gdkmonitor={gdkmonitor}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			anchor={TOP | LEFT | RIGHT}
			application={App}>
			<centerbox
				className="window-bar"
			>
				<TopLeft />
				<TopCentre />
				<TopRight />
			</centerbox>
		</window>
	);
}
