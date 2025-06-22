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

	const Progress = (player: MprisPlayer) => {
		return <EventBox
			className="invisible"
			onScroll={(_, event) => player.position += (event.delta_y < 0 ? -5 : 5)}
		> <CircularProgress
				className="volumeLevel"
				rounded={false}
				inverted={false}
				startAt={0.75}
			// setup={self => {
			// 	const update = () => self.value = player.position / player.length;
			// 	self.poll(1000, update);
			// }}
			/>
		</EventBox >
	}

	const Media = (p: Mpris.Player) => {
		const NowPlaying = () => <box>
			<label
				label={bind(p, "artist")}
				className="musicSubText"
				// widthChars: 20,
				maxWidthChars={20}
				// truncate="end"
				halign={Gtk.Align.START}
			/>
			<label
				label={bind(p, "title")}
				className="musicText"
				// widthChars: 20,
				maxWidthChars={20}
				// truncate: "end",
				halign={Gtk.Align.START}
			/>
		</box>
		return <EventBox
			onClick={() => p.play_pause()}
			onScroll={(_, event) => event.delta_y < 0 ? p.previous() : p.next()}
		>
			{NowPlaying()}
		</EventBox>
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
