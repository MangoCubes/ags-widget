import { createBinding, createComputed, createState } from "ags";
import Mpris from "gi://AstalMpris";
import Gtk from "gi://Gtk";
import { With, Accessor } from "ags"
import Pango from "gi://Pango";

const mpris = Mpris.get_default();

export const TopCentre = () => {

	const Media = (p: Mpris.Player) => {
		type MediaState = {
			artist: string,
			title: string
		};
		const artist = createBinding(p, "artist");
		const title = createBinding(p, "title");
		const len = createBinding(p, "length");
		const pos = createBinding(p, "position");
		const prog = createComputed([len, pos], (len, pos) => pos / len);
		const ms = createComputed([artist, title], (artist, title) => { return { artist: artist, title: title } });
		const NowPlaying = (ms: MediaState) => {
			if (ms.artist && ms.artist.length) {
				return (<box>
					<label
						label={ms.artist}
						class="musicSubText"
						widthChars={10}
						maxWidthChars={10}
						halign={Gtk.Align.CENTER}
						valign={Gtk.Align.CENTER}
						ellipsize={Pango.EllipsizeMode.END}
					/>
					<label
						label={ms.title}
						class="musicText"
						widthChars={20}
						maxWidthChars={20}
						valign={Gtk.Align.CENTER}
						halign={Gtk.Align.START}
						ellipsize={Pango.EllipsizeMode.END}
					/>
				</box>);
			} else {
				return (<box>


					<label
						label=""
						class="musicSubText"
						widthChars={5}
						maxWidthChars={5}
					/>
					<label
						label={ms.title}
						class="musicText"
						widthChars={20}
						maxWidthChars={20}
						halign={Gtk.Align.CENTER}
						valign={Gtk.Align.CENTER}
						ellipsize={Pango.EllipsizeMode.END}
					/>
					<label
						label=""
						class="musicSubText"
						widthChars={5}
						maxWidthChars={5}
					/>
				</box>);
			}
		};
		return <box spacing={1} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER} vexpand>
			<box vexpand hexpand><With value={ms}>{ms => NowPlaying(ms)}</With></box>
			<box><With value={prog}>{prog => <slider hexpand class="progressBar" value={prog} />}</With></box>
		</box>

		// return (<box
		// onClick={() => p.play_pause()}
		// onScroll={(_, event) => event.delta_y < 0 ? p.previous() : p.next()}
		// >

		// </Gtk.EventBox>);
	}

	const player = createBinding(mpris, "players").as(p => p.find(pl => pl.title) ?? null);
	return <box halign={Gtk.Align.CENTER}
	><With value={player}>{(p) => {
		if (p) return Media(p);
		else return (<label
			label="Play something!"
			class="musicText"
		/>)
	}}</With></box>
}

