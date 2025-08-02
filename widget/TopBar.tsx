import { TopLeft } from "./TopBar/TopLeft"
import { TopRight } from "./TopBar/TopRight"
import { TopCentre } from "./TopBar/TopCentre"
import Astal from "gi://Astal"
import { Gtk } from "ags/gtk4"
import { CallbackTree } from "../app"
import GObject from "ags/gobject"
export const TopBar: (monId: number) => {
	comp: GObject.Object;
	callbacks: CallbackTree;
} = (monId) => {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

	const topCentre = TopCentre();

	return {
		comp: (
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
					{topCentre.comp}
					<TopRight />
				</box>
			</window>
		), callbacks: { ...topCentre.callbacks }
	};
}
// <TopLeft />
// <TopCentre />

