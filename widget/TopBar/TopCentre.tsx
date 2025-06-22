import Binding, { bind } from "astal/binding";
import { CircularProgress, EventBox } from "astal/gtk3/widget";
import Variable from "astal/variable";
import Mpris from "gi://AstalMpris";
import Gtk from "gi://Gtk";

const mpris = Mpris.get_default();

export const TopCentre = () => {

	// const genCss = (progress: number | null) => {
	//     if (progress) {
	//         const whole = Math.ceil(progress * 100);
	//         return `
	//             background: linear-gradient(to right, #47c8c0 ${whole}%, transparent ${whole}%);
	//         `;
	//     }
	//     else return `
	//         background: transparent;
	//     `;
	// }


	const Media = (p: Mpris.Player) => {
		const NowPlaying = () => <box spacing={8}
		>
			<label
				label={bind(p, "artist")}
				className="musicSubText"
				widthChars={12}
				maxWidthChars={12}
				truncate
				halign={Gtk.Align.START}
			/>
			<label
				label={bind(p, "title")}
				className="musicText"
				widthChars={12}
				maxWidthChars={12}
				truncate
			/>
		</box>

		const Progress = () => <box className="debug">
		</box>
		return (<EventBox
			onClick={() => p.play_pause()}
			onScroll={(_, event) => event.delta_y < 0 ? p.previous() : p.next()}
		>
			<box spacing={1} vertical>
				<NowPlaying />
				<Progress />
			</box>
		</EventBox>);
	}

	const TopCentreContent = () => {
		const player: Binding<Mpris.Player | null> = Variable.derive([bind(mpris, "players")])().as(p => p[0][0] ?? null);

		return player.as(p => {
			if (p) return Media(p);
			else return (<label
				label="Play something!"
				className="musicText"
				halign={Gtk.Align.START}
			/>);
		})
	}

	return <box
		className="barContent">
		{TopCentreContent()}
	</box>
}
