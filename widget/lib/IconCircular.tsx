import Gtk from "gi://Gtk";

export const IconCircular = (props: { value: number, icon: string, iconClass: string, circularClass: string, ringClass: string }) => {
	return (
		<overlay
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
		>
			<label
				class={props.iconClass}
				label={props.icon + ` ${Math.floor(props.value * 100).toString(16).toUpperCase().padStart(2, "0")}`}
			/>
		</overlay>
	);
}

