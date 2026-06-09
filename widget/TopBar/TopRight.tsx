import WirePlumber from "gi://AstalWp";
import AstalBattery from "gi://AstalBattery";
import Tray from "gi://AstalTray";
import { IconCircular } from "../lib/IconCircular";
import { ProgressBar } from "../lib/ProgressBar";
import { Accessor, createBinding, createComputed, With } from "ags";
import { createPoll } from "ags/time";
import Gtk from "gi://Gtk";
import { Syncthing } from "../bindings/syncthing";

const wp = WirePlumber.get_default();
const batt = AstalBattery.get_default();

const RamUsage = () => {
	const ram = createPoll('', 5000, `free`, s => {
		// Find the line that contains the memory stats
		const memLine = s.split('\n').find(line => line.trim().startsWith("Mem:"));

		if (!memLine) {
			return "N/A";
		}

		const parts = memLine.trim().split(/\s+/);
		return parts[2] / parts[1];
	});
	return (
		<box>
			<With value={ram}>
				{(ram) => ram && <IconCircular
					iconClass="ram-icon"
					circularClass="ram-progress"
					value={ram}
					icon=""
					textClass="ram-text"
				/>}
			</With>
		</box>
	);
}

const SysTray = () => {
	const tray = Tray.get_default();

	const getLineColour = (status: Tray.Status) => {
		if (status == Tray.Status.NEEDS_ATTENTION) return "tray-attention";
		if (status == Tray.Status.ACTIVE) return "tray-active";
		return "tray-item";
	};
	return (
		<box>
			<With value={createBinding(tray, "items")}>{(items) => (
				<box spacing={4} hexpand>
					{items.map(item => (
						<button
							class={getLineColour(createBinding(item, "status"))}
							tooltipMarkup={createBinding(item, "tooltipMarkup")}
							onDestroy={() => item.destroy()}
							onClicked={(self) => item.activate(0, 0)}
						>
							<image gicon={createBinding(item, "gicon")} />
						</button>
					))}
				</box>
			)}</With>
		</box>
	);
}

const SyncthingStatus = () => {
	const st = Syncthing.get_default();
	const hasKey = createBinding(st, "hasKey");
	const available = createBinding(st, "available");
	const connected = createBinding(st, "connectedDevices");
	const total = createBinding(st, "totalDevices");
	const completion = createBinding(st, "completion");
	const syncing = createBinding(st, "syncing");
	const info: Accessor<[boolean, boolean, number, number, number, boolean]> = createComputed(
		[hasKey, available, connected, total, completion, syncing],
		(h, a, c, t, comp, s) => [h, a, c, t, comp, s]
	);

	return (
		<box><With value={info}>{([hasKey, available, connected, total, completion, syncing]) => {
			if (!hasKey) {
				return (
					<box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} vexpand>
						<box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} vexpand>
							<label class="syncthing-icon" label="󰌊" />
							<label class="syncthing-text" label=" KEY" />
						</box>
						<ProgressBar className="syncthing-progress" value={0} />
					</box>
				);
			}
			if (!available) {
				return (
					<box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} vexpand>
						<box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} vexpand>
							<label class="syncthing-icon" label="" />
							<label class="syncthing-text" label=" OFF" />
						</box>
						<ProgressBar className="syncthing-progress" value={0} />
					</box>
				);
			}
			const icon = syncing ? "󰁪" : connected > 0 ? "󰌘" : "󰌙";
			const progress = completion / 100;
			return (
				<box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} vexpand>
					<box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} vexpand>
						<label
							widthChars={1}
							maxWidthChars={1}
							class="syncthing-icon"
							label={icon}
						/>
						<label
							widthChars={3}
							maxWidthChars={3}
							class="syncthing-text"
							label={syncing
								? ` ${Math.floor(completion).toString().padStart(2, "0")}%`
								: ` ${connected}/${total}`
							}
						/>
					</box>
					<ProgressBar className="syncthing-progress" value={progress} />
				</box>
			);
		}}</With></box>
	);
}

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
			spacing={4}
			hexpand
		>
			<SysTray />
			<SyncthingStatus />
			<RamUsage />
			{wp ? Volume(wp) : null}
			{Battery(batt)}
		</box>
	);
}

