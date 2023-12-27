import { Font } from "../types/font";
import { Config } from "../util/config";
import * as unicode from "../util/unicode";
import * as archives from "../util/archives";
import AdmZip from "adm-zip";
import { FontMap } from "../types/util";

export async function readFontFiles(pack: AdmZip, config: Config): Promise<FontMap> {
    const map = new Map<string, string>();

    const files = archives.listFilePathsInZip(pack, 'assets', '.json').filter(file => file.split('/')[2] === 'font');

    if (files.length === 0) {
        throw new Error('Could not find any font files in pack');
    }

    for (const file of files) {
        const font = await archives.parseJsonFromZip<Font>(pack, file);

        let character = config.startCharcter!;
    
        for (const provider of font.providers) {
            if (provider.type !== 'bitmap') {
                continue;
            }
    
            for (const entry of provider.chars) {
                const characters = Array.from(entry);
    
                for (const char of characters) {
                    if (!unicode.aboveChar(char, config.maxIgnoreCharacter!)) {
                        continue;
                    }
        
                    if (map.has(char)) {
                        continue;
                    }
    
                    map.set(char, character);
                    character = unicode.nextChar(character);
                }
            }
        }
    }
    
    return { map, files };
}