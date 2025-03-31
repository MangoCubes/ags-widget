import { App } from "astal/gtk3"
import style from "./css/style.scss"
import { TopBar } from "./widget/TopBar"

App.start({
	css: style,
	main() {
		App.get_monitors().map(TopBar);
	},
})
