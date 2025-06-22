import Binding, { bind } from "astal/binding";
import { CircularProgress, EventBox, Slider } from "astal/gtk3/widget";
import Variable from "astal/variable";
import Mpris from "gi://AstalMpris";
import Gtk from "gi://Gtk";

const mpris = Mpris.get_default();

export const TopCentre = () => {

	const Media = (p: Mpris.Player) => {
		const NowPlaying = () => <box spacing={8}
		>
			<label
				label={bind(p, "artist")}
				className="musicSubText"
				widthChars={10}
				maxWidthChars={10}
				truncate
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
			/>
			<label
				label={bind(p, "title")}
				className="musicText"
				widthChars={20}
				maxWidthChars={20}
				truncate
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
			/>
		</box>
		const progressInfo = Variable.derive([bind(p, "position"), bind(p, "length")])().as(([pos, len]) => pos / len);
		return (<EventBox
			onClick={() => p.play_pause()}
			onScroll={(_, event) => event.delta_y < 0 ? p.previous() : p.next()}
		>
			<box spacing={1} vertical>
				<NowPlaying />
				<Slider className="progressBar" value={progressInfo} />
			</box>
		</EventBox>);
	}

	const TopCentreContent = () => {
		const player: Binding<Mpris.Player | null> = bind(mpris, "players").as(p => p.find(pl => pl.title) ?? null);

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
