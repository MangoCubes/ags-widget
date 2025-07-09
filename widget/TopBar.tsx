import { TopLeft } from "./TopBar/TopLeft"
import { TopRight } from "./TopBar/TopRight"
import { TopCentre } from "./TopBar/TopCentre"
import Astal from "gi://Astal"
import { Gtk } from "ags/gtk4"
export const TopBar = (monId: number) => {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

	return (
		<window
			visible
			anchor={TOP | LEFT | RIGHT}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			class="window-bar-container"
			monitor={monId}
		>
			<box
				halign={Gtk.Align.FILL}
				orientation={Gtk.Orientation.HORIZONTAL}
				class="window-bar"
				homogeneous
			>
				<TopLeft />
				<TopCentre />
				<TopRight />
			</box>
		</window>
	)
}
// <TopLeft />
// <TopCentre />

