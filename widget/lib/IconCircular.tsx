import { Gtk } from "astal/gtk3";
import { CircularProgress, Icon, Overlay } from "astal/gtk3/widget";

export const IconCircular = (props: { value: number, icon: string, iconClass: string, circularClass: string }) => {
	return (
		<Overlay
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
		>
			<CircularProgress
				className={props.circularClass}
				rounded={false}
				inverted={false}
				startAt={0.75}
				endAt={0.75}
				value={props.value}
			/>
			<Icon
				className={props.iconClass}
				icon={props.icon}
			/>
		</Overlay>
	);
}

