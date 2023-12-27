#! /usr/bin/env node

import packageJson from './package.json';
import { readFontFiles } from './src/puamap/reader';
import { writeFontFiles, writeFontMap, writeLangFiles } from './src/puamap/writer';
import { getConfig } from './src/util/config';
import { MessageType, statusMessage } from "./src/util/console";
import AdmZip from 'adm-zip';
import path from 'path';

async function main(): Promise<void> {
    // Needed for exit handler
    process.stdin.resume();
    const startTime = Date.now();

    statusMessage(MessageType.Info, `Starting ${packageJson.name} v${packageJson.version}...`);

    const config = await getConfig();
    const inputAssetsZip = new AdmZip(config.inputJavaPack!);

    const fontMap = await readFontFiles(inputAssetsZip, config);

    await writeFontFiles(inputAssetsZip, fontMap);
    await writeLangFiles(inputAssetsZip, fontMap);
    await writeFontMap(fontMap);

    inputAssetsZip.writeZip(path.join(process.cwd(), 'target', 'output.zip'));

    const completionTime = (Date.now() - startTime) / 1000;
    statusMessage(MessageType.Completion, `Remapping of ${fontMap.map.size} characters complete in ${completionTime}s`);

    process.exit(0);
}

main();