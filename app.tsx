import app from "ags/gtk4/app"
import { TopBar } from "./widget/TopBar";
import scss from "./css/style.scss";

app.start({
	css: scss,
	main() {
		app.get_monitors().map((a, b) => TopBar(b));
	},
})
