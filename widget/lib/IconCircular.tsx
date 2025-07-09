import Gtk from "gi://Gtk";

export const IconCircular = (props: { value: number, icon: string, iconClass: string, circularClass: string, textClass: string }) => {
	return (
		<box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER} vexpand>
			<box
				valign={Gtk.Align.CENTER}
				halign={Gtk.Align.CENTER}
				vexpand
			>
				<label
					class={props.iconClass}
					label={props.icon}
				/>
				<label
					widthChars={3}
					maxWidthChars={3}
					class={props.textClass}
					label={` ${props.value >= 1 ? "MX" : Math.floor(props.value * 100).toString(16).toUpperCase().padStart(2, "0")}`}
				/>
			</box>

			<slider class={props.circularClass} value={props.value} />
		</box>
	);
}

