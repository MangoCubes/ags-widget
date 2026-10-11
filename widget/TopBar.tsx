import { TopLeft } from "./TopBar/TopLeft"
import { TopRight } from "./TopBar/TopRight"
import { TopCentre } from "./TopBar/TopCentre"
import Astal from "gi://Astal"
import { Gdk, Gtk } from "ags/gtk4"
import { CallbackTree } from "../app"
import GObject from "ags/gobject"
export const TopBar = (monitor: Gdk.Monitor): { comp: GObject.Object; callbacks: CallbackTree } => {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

	const topCentre = TopCentre();

	return {
		comp: (
			<window
				visible
				anchor={TOP | LEFT | RIGHT}
				exclusivity={Astal.Exclusivity.EXCLUSIVE}
				class="window-bar-container"
				gdkmonitor={monitor}
			>
				<box
					halign={Gtk.Align.FILL}
					orientation={Gtk.Orientation.HORIZONTAL}
					homogeneous
				>
					<box class="topleft-container">
						<TopLeft />
					</box>
					<box>
						<box class="mikuHairClip" />
						<box class="topcentre-container">
							{topCentre.comp}
						</box>
						<box class="mikuHairClip" />
					</box>
					<box class="topright-container">
						<TopRight />
					</box>
				</box>
			</window>
		), callbacks: { ...topCentre.callbacks }
	};
}
