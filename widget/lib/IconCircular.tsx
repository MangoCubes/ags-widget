import Gtk from "gi://Gtk";

export const IconCircular = (props: { value: number, icon: string, iconClass: string, circularClass: string, ringClass: string }) => {
	return (
		<overlay
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
		>
			<label label={props.value.toString()} />
			<box class={props.ringClass} />
			<label
				class={props.iconClass}
				label={props.icon}
			/>
		</overlay>
	);
}

