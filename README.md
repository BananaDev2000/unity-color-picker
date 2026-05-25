# Unity Colors Picker for VS Code

Adds proper color picker support for Unity `Color`, `Color32`, named colors, and Unity HTML hex colors directly inside C# scripts.
This tool was made using AI, please feel free to correct or clean up anything you want :)

## Features

Supports:

```csharp
new Color(1f, 0f, 0f, 1f)

new Color32(255, 120, 0, 255)

Color.red

Color.green

ColorUtility.TryParseHtmlString("#FF9900", out Color color);
```

The extension automatically:

- Detects Unity color constructors
- Shows inline color preview squares
- Opens VS Code's built-in color picker
- Updates values directly in code

## Examples

### Color

```csharp
Color playerColor = new Color(0.2f, 0.8f, 1f, 1f);
```

### Color32

```csharp
Color32 enemyColor = new Color32(255, 80, 80, 255);
```

### Named Colors

```csharp
Color uiColor = Color.red;
```

### Unity Hex Colors

```csharp
ColorUtility.TryParseHtmlString("#FF9900", out Color color);
```

## Installation

Install directly from the VS Code Marketplace.

Or manually install the `.vsix` package:
Download the latest `.vsix` package under releases [here](https://github.com/BananaDev2000/unity-color-picker/releases).
1. Open Extensions
2. Click `...`
3. Select `Install from VSIX...`

## Known Limitations

Currently supports:

- Color values between 0-1 `new Color(...)`
- RGB color values between 0-255 `new Color32(...)`
- Unity named colors `Color.red`
- Hex colors `ColorUtility.TryParseHtmlString(...)`

## Roadmap

Possible future work/features feel free to claim and work on it:

- UI Toolkit USS color support
- Gradient previews
- HDR color support

## Release Notes

### 0.0.1

Initial release:
- Unity `Color` support
- Unity `Color32` support
- Named color support
- Unity HTML hex support
- Inline VS Code color picker integration
