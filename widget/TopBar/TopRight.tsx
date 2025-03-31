import Binding, { bind } from "astal/binding";
import { Gtk } from "astal/gtk3";
import { EventBox } from "astal/gtk3/widget";
import { Variable } from "astal/variable";
import WirePlumber from "gi://AstalWp";
import AstalBattery from "gi://AstalBattery";
import { IconCircular } from "../lib/IconCircular";
import Brightness from "../bindings/brightness";

const brightness = Brightness.get_default()
const wp = WirePlumber.get_default();
const batt = AstalBattery.get_default();

const Battery = (b: AstalBattery.Device) => {
	const comps = ([isBattery, icon, percentage]: [boolean, string, number]) => {
		const getNewBrightness = (up: boolean) => {
			let newBrightness = brightness.screen;
			if (up) newBrightness += 0.03;
			else newBrightness -= 0.03;
			if (newBrightness > 1) return 1;
			if (newBrightness < 0.01) return 0.01;
			else return newBrightness;
		}
		return (
			<EventBox
				onScroll={(_, event) => brightness.screen = getNewBrightness(event.delta_y < 0)}
			>
				<IconCircular
					iconClass="battery-icon"
					circularClass="battery-progress"
					value={isBattery ? percentage : 1}
					icon={isBattery ? icon : "battery-full-symbolic"}
				/>
			</EventBox>
		);
	};
	return Variable.derive([bind(b, "is_battery"), bind(b, "icon_name"), bind(b, "percentage")])().as(comps);
}

const Volume = (w: WirePlumber.Wp) => {
	const speaker = w.audio.default_speaker;

	const comps = ([volume, icon]: [number, string]) => {
		const getNewVolume = (up: boolean) => {
			let newVolume = volume;
			if (up) newVolume += 0.03;
			else newVolume -= 0.03;
			if (newVolume > 1) return 1;
			if (newVolume < 0) return 0;
			else return newVolume;
		}
		return (
			<EventBox
				onScroll={(_, event) => speaker.set_volume(getNewVolume(event.delta_y < 0))}
			>
				<IconCircular
					iconClass="volume-icon"
					circularClass="volume-progress"
					value={volume}
					icon={volume ? icon : "audio-volume-muted-symbolic"}
				/>
			</EventBox>


		);
	};

	return Variable.derive([bind(speaker, "volume"), bind(speaker, "volume_icon")])().as(comps);
}

const Wrapper = (comp: Gtk.Widget | Binding<Gtk.Widget>) => {
	return (
		<box
			className="wrapper"
		>
			{comp}
		</box>
	);
}

export const TopRight = () => {
	// Note: The subcomponent order is reversed
	return (
		<box
			className="topright-container"
			vexpand={false}
			halign={Gtk.Align.END}
			spacing={4}
		>
			{wp ? Wrapper(Volume(wp)) : null}
			{Wrapper(Battery(batt))}
		</box>
	);
}

