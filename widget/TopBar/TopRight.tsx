import WirePlumber from "gi://AstalWp";
import AstalBattery from "gi://AstalBattery";
import { IconCircular } from "../lib/IconCircular";
import { Accessor, createBinding, createComputed, With } from "ags";
import Gtk from "gi://Gtk";

const wp = WirePlumber.get_default();
const batt = AstalBattery.get_default();

const Battery = (b: AstalBattery.Device) => {
	const percentage = createBinding(b, "percentage");
	const isBattery = createBinding(b, "is_battery");
	const charging = createBinding(b, "charging");
	const batteryInfo: Accessor<[number, boolean, boolean]> = createComputed([percentage, isBattery, charging], (p, b, c) => [p, b, c]);

	return (
		<box><With value={batteryInfo}>{([percentage, isBattery, charging]) => {
			// Value above 0.95 is considered 100%
			const adjusted = percentage * 100 > 95 ? 1 : percentage;
			const icons = ["󰂎", "󰁺", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"];
			const iconsCharging = ["󰢟", "󰢜", "󰂆", "󰂇", "󰂈", "󰢝", "󰂉", "󰢞", "󰂊", "󰂋", "󰂅"];
			return (
				<IconCircular
					iconClass="battery-icon"
					circularClass="battery-progress"
					value={isBattery ? adjusted : 1}
					icon={isBattery ? ((charging ? iconsCharging : icons)[Math.floor(adjusted * 10)]) : "󰚥"}
					textClass="battery-text"
				/>
			);

		}}</With></box>
	);
}

const Volume = (w: WirePlumber.Wp) => {
	const speaker = w.audio.default_speaker;
	const vol = createBinding(speaker, "volume");

	return <box><With value={vol}>{(volume) => {
		const icons = ["󰝟", "󰕿", "󰖀", "󰕾", "󱄠", "󰸈"];
		let icon;
		if (volume === 0) icon = icons[0];
		else if (volume < 0.33) icon = icons[1];
		else if (volume < 0.66) icon = icons[2];
		else if (volume < 1) icon = icons[3];
		else icon = icons[4];
		return (
			<IconCircular
				iconClass="volume-icon"
				circularClass="volume-progress"
				value={volume}
				icon={icon}
				textClass="volume-text"
			/>
		);

	}}</With></box>

}


export const TopRight = () => {
	// Note: The subcomponent order is reversed
	return (
		<box
			halign={Gtk.Align.END}
			spacing={8}
			hexpand
		>
			{wp ? Volume(wp) : null}
			{Battery(batt)}
		</box>
	);
}

