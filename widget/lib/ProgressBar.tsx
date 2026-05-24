import { With, Binding } from "ags";

export const ProgressBar = (props: { value: number | Binding<number>, className: string }) => {
	const getCss = (n: number) => {
		if (n < 0) n = 0;
		else if (n > 1) n = 1;
		const p = Math.round(n * 100);
		return `background: linear-gradient(to right, currentColor 0%, currentColor ${p}%, transparent ${p}%, transparent 100%);`;
	};

	if (typeof (props.value) == "number") return <box hexpand class={props.className} css={getCss(props.value)} />;
	else return <With value={props.value}>{v =>
		<box hexpand class={props.className} css={getCss(v)} />
	}</With>;
};
