import * as vscode from "vscode";

const namedColors: Record<string, vscode.Color> = {
	clear: new vscode.Color(0, 0, 0, 0),
	black: new vscode.Color(0, 0, 0, 1),
	white: new vscode.Color(1, 1, 1, 1),
	red: new vscode.Color(1, 0, 0, 1),
	green: new vscode.Color(0, 1, 0, 1),
	blue: new vscode.Color(0, 0, 1, 1),
	yellow: new vscode.Color(1, 0.9215686, 0.01568628, 1),
	cyan: new vscode.Color(0, 1, 1, 1),
	magenta: new vscode.Color(1, 0, 1, 1),
	gray: new vscode.Color(0.5, 0.5, 0.5, 1),
	grey: new vscode.Color(0.5, 0.5, 0.5, 1)
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerColorProvider(
			{ language: "csharp", scheme: "file" },
			new UnityColorProvider()
		)
	);
}

class UnityColorProvider implements vscode.DocumentColorProvider {
	provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
		const colors: vscode.ColorInformation[] = [];
		const text = document.getText();

		this.findConstructors(document, text, colors);
		this.findNamedColors(document, text, colors);
		this.findUnityHexColors(document, text, colors);

		return colors;
	}

	provideColorPresentations(
		color: vscode.Color,
		context: { document: vscode.TextDocument; range: vscode.Range }
	): vscode.ColorPresentation[] {
		const original = context.document.getText(context.range);

		if (original.includes("Color32")) {
			return [
				new vscode.ColorPresentation(
					`new Color32(${this.to255(color.red)}, ${this.to255(color.green)}, ${this.to255(color.blue)}, ${this.to255(color.alpha)})`
				)
			];
		}

		if (original.startsWith("\"#") || original.startsWith("'#")) {
			const quote = original[0];
			return [
				new vscode.ColorPresentation(`${quote}${this.toHex(color)}${quote}`)
			];
		}

		const exactName = this.getExactNamedColor(color);
		if (original.startsWith("Color.") && exactName) {
			return [
				new vscode.ColorPresentation(`Color.${exactName}`)
			];
		}

		return [
			new vscode.ColorPresentation(
				`new Color(${this.clean(color.red)}f, ${this.clean(color.green)}f, ${this.clean(color.blue)}f, ${this.clean(color.alpha)}f)`
			)
		];
	}

	private findConstructors(
		document: vscode.TextDocument,
		text: string,
		colors: vscode.ColorInformation[]
	) {
		const regex = /new\s+(Color32|Color)\s*\(([^)]*)\)/g;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			const type = match[1];
			const args = match[2]
				.split(",")
				.map(x => x.trim().replace(/f$/i, ""));

			if (type === "Color" && args.length >= 3) {
				const r = Number(args[0]);
				const g = Number(args[1]);
				const b = Number(args[2]);
				const a = args.length >= 4 ? Number(args[3]) : 1;

				if ([r, g, b, a].every(Number.isFinite)) {
					colors.push(
						this.makeColor(document, match.index, match[0].length, r, g, b, a)
					);
				}
			}

			if (type === "Color32" && args.length >= 4) {
				const r = Number(args[0]) / 255;
				const g = Number(args[1]) / 255;
				const b = Number(args[2]) / 255;
				const a = Number(args[3]) / 255;

				if ([r, g, b, a].every(Number.isFinite)) {
					colors.push(
						this.makeColor(document, match.index, match[0].length, r, g, b, a)
					);
				}
			}
		}
	}

	private findNamedColors(
		document: vscode.TextDocument,
		text: string,
		colors: vscode.ColorInformation[]
	) {
		const regex = /\bColor\.(clear|black|white|red|green|blue|yellow|cyan|magenta|gray|grey)\b/g;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			const color = namedColors[match[1]];

			colors.push(
				this.makeColor(
					document,
					match.index,
					match[0].length,
					color.red,
					color.green,
					color.blue,
					color.alpha
				)
			);
		}
	}

	private findUnityHexColors(
		document: vscode.TextDocument,
		text: string,
		colors: vscode.ColorInformation[]
	) {
		const regex = /ColorUtility\.TryParseHtmlString\s*\(\s*(["'])#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})\1/g;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			const quote = match[1];
			const hex = match[2];

			const fullText = `${quote}#${hex}${quote}`;
			const localIndex = match[0].indexOf(fullText);
			const start = match.index + localIndex;

			const r = parseInt(hex.substring(0, 2), 16) / 255;
			const g = parseInt(hex.substring(2, 4), 16) / 255;
			const b = parseInt(hex.substring(4, 6), 16) / 255;
			const a = hex.length === 8
				? parseInt(hex.substring(6, 8), 16) / 255
				: 1;

			colors.push(
				this.makeColor(document, start, fullText.length, r, g, b, a)
			);
		}
	}

	private makeColor(
		document: vscode.TextDocument,
		start: number,
		length: number,
		r: number,
		g: number,
		b: number,
		a: number
	): vscode.ColorInformation {
		const range = new vscode.Range(
			document.positionAt(start),
			document.positionAt(start + length)
		);

		return new vscode.ColorInformation(
			range,
			new vscode.Color(r, g, b, a)
		);
	}

	private clean(value: number): string {
		return value.toFixed(3).replace(/\.?0+$/, "");
	}

	private to255(value: number): number {
		return Math.round(value * 255);
	}

	private toHex(color: vscode.Color): string {
		const r = this.to255(color.red).toString(16).padStart(2, "0");
		const g = this.to255(color.green).toString(16).padStart(2, "0");
		const b = this.to255(color.blue).toString(16).padStart(2, "0");
		const a = this.to255(color.alpha).toString(16).padStart(2, "0");

		if (a.toLowerCase() === "ff") {
			return `#${r}${g}${b}`.toUpperCase();
		}

		return `#${r}${g}${b}${a}`.toUpperCase();
	}

	private getExactNamedColor(color: vscode.Color): string | undefined {
		for (const [name, named] of Object.entries(namedColors)) {
			if (
				this.to255(color.red) === this.to255(named.red) &&
				this.to255(color.green) === this.to255(named.green) &&
				this.to255(color.blue) === this.to255(named.blue) &&
				this.to255(color.alpha) === this.to255(named.alpha)
			) {
				return name;
			}
		}

		return undefined;
	}
}

export function deactivate() { }