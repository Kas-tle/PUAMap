# PUAMap [![License: AGPL](https://img.shields.io/badge/license-AGPL-blue.svg)](LICENSE) [![npm version](https://badge.fury.io/js/puamap.svg)](https://badge.fury.io/js/puamap)
Remaps custom emoji in a Minecraft resource pack to use the Unicode Private Use Area

## Usage
Run in the directory containing the resource pack you want to remap:
```
npx puamap
```

## Options
Options are generally automatically configured and written to `config.json` on run.
- `inputJavaPack`: The path to the input Java Edition resource pack
- `startCharcter`: The first character to use in the remapping (default: `\uE200`)
- `maxIgnoreCharacter`: The highest character ignore in remapping (default: `\u007F`)

## Outputs
- `target/output.zip`: The remapped resource pack with replacements made in font and lang files
- `target/replacements.json`: A list of all the replacements made
- `target/replacements_escaped.json`: A list of all the replacements made, with non-ASCII characters escaped