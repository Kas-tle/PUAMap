import AdmZip from "adm-zip";
import { Font, Providers } from "../types/font";
import * as archives from "../util/archives";
import * as files from "../util/files";
import { FontMap } from "../types/util";
import { Lang } from "../types/lang";

export async function writeFontFiles(pack: AdmZip, fontMap: FontMap): Promise<void> {
    for (const file of fontMap.files) {
        const font = await archives.parseJsonFromZip<Font>(pack, file);

        for (let i = 0; i < font.providers.length; i++) {
            const provider = font.providers[i];
            
            if (provider.type !== 'bitmap') {
                continue;
            }
    
            for (let k = 0; k < provider.chars.length; k++) {
                const characters = Array.from(provider.chars[k]);
    
                for (let k = 0; k < characters.length; k++) {
                    const char = characters[k];
    
                    const newChar = fontMap.map.get(char);
                    
                    if (newChar) {
                        characters[k] = newChar;
                    }
                }
    
                (font.providers[i] as Providers.Bitmap).chars[k] = characters.join('');
            }
        }

        archives.insertRawInZip(pack, [{file, data: Buffer.from(JSON.stringify(font, null, 4))}]);
    }
}

export async function writeLangFiles(pack: AdmZip, fontMap: FontMap): Promise<void> {
    const langFiles = archives.listFilePathsInZip(pack, 'assets', '.json').filter(file => file.split('/')[2] === 'lang');

    for (const file of langFiles) {
        const lang = await archives.parseJsonFromZip<Lang>(pack, file);

        for (const key in lang) {
            const value = Array.from(lang[key]);

            const newValue = value.map(char => fontMap.map.get(char) || char).join('');
            lang[key] = newValue;
        }

        archives.insertRawInZip(pack, [{file, data: Buffer.from(JSON.stringify(lang, null, 4))}]);
    }
}

export async function writeFontMap(fontMap: FontMap): Promise<void> {
    const fontMapJson = Object.fromEntries(fontMap.map);
    files.writeJsonFile('target/replacements.json', fontMapJson);

    // write escaped version
    let string = JSON.stringify(fontMapJson, null, 4);
    string  = string.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    })

    files.writeTextFile('target/replacements_escaped.json', string);
}