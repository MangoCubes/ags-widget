import { createBinding, createComputed, createState } from "ags";
import Mpris from "gi://AstalMpris";
import Gtk from "gi://Gtk";
import { With } from "ags"
import Pango from "gi://Pango";
import { CallbackComp, CallbackTree } from "../../app";

const mpris = Mpris.get_default();

export const TopCentre: CallbackComp = () => {

	// Player ID state management
	const [pid, setPid] = createState(0);

	const Media = (p: Mpris.Player) => {
		type MediaState = {
			artist: string,
			title: string,
			status: Mpris.PlaybackStatus
		};
		const artist = createBinding(p, "artist");
		const status = createBinding(p, "playbackStatus");
		const title = createBinding(p, "title");
		const len = createBinding(p, "length");
		const pos = createBinding(p, "position");
		const prog = createComputed([len, pos], (len, pos) => pos / len);
		const ms = createComputed([artist, title, status], (artist, title, status) => { return { artist: artist, title: title, status: status } });
		const NowPlaying = (ms: MediaState) => {
			if (ms.artist && ms.artist.length) {
				let sym = "";
				switch (ms.status) {
					case Mpris.PlaybackStatus.PAUSED:
						sym = "󰏤";
						break;
					case Mpris.PlaybackStatus.PLAYING:
						sym = "󰐊";
						break;
					case Mpris.PlaybackStatus.STOPPED:
						sym = "󰓛";
						break;
				}
				return (
					<box spacing={2}>
						<label
							label={sym}
							class="musicText"
							widthChars={1}
							maxWidthChars={1}
							halign={Gtk.Align.CENTER}
							valign={Gtk.Align.CENTER}
						/>
						<label
							label={ms.artist}
							class="musicSubText"
							widthChars={15}
							maxWidthChars={15}
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

	const players = createBinding(mpris, "players");
	const nothing = (<label
		label="Play something!"
		class="musicText"
	/>)
	const comp = (
		<box halign={Gtk.Align.CENTER} hexpand>
			<With value={players}>
				{(p) => {
					if (p.length) return (
						<box>
							<With value={pid}>
								{(id) => {
									if (p[id]) return Media(p[id]);
									else return nothing;
								}}
							</With>
						</box>
					);
					else return nothing;
				}}
			</With>
		</box>
	);
	const changePid = (original: number) => {
		const playerLen = players.get().length;
		original = original % playerLen;
		if (original < 0) original += playerLen;
		return original;
	}
	const callbacks: CallbackTree = {
		player: {
			next: [() => {
				setPid(pid => changePid(pid + 1));
				return null;
			}],
			prev: [() => {
				setPid(pid => changePid(pid - 1));
				return null;
			}],
			get: [() => players.get()[pid.get()]?.bus_name.replace("org.mpris.MediaPlayer2.", "") ?? null]
		}
	};

	return {
		comp: comp,
		callbacks: callbacks,
	};
}

