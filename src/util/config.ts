import fs from 'fs';
import path from 'path';
import { MessageType, statusMessage } from './console';
import { select, input, confirm } from '@inquirer/prompts';
import * as files from './files';
import * as unicode from './unicode';

export interface Config {
    inputJavaPack: string | null;
    startCharcter: string | null;
    maxIgnoreCharacter: string | null;
}

const defaultConfig: Config = {
    inputJavaPack: null,
    startCharcter: null,
    maxIgnoreCharacter: null
};

let cachedConfig: Config | null = null;

export async function getConfig(): Promise<Config> {
    if (cachedConfig) {
        return cachedConfig;
    }
    try {
        const config = await files.parseJsonFile<Config>(files.absolutePath('config.json'));
        cachedConfig = config;
        return config;
    } catch (err) {
        statusMessage(
            MessageType.Info, 
            "No config file found. Please provide the required config values",
            "Simply input the value and press enter to proceed to the next value",
            "If you need help, please visit https://github.com/Kas-tle/PUAMap",
            "Press Ctrl+C to cancel"
        );
        statusMessage(MessageType.Plain, "");
        const newConfig = await promptForConfig();
        await fs.promises.writeFile("config.json", JSON.stringify(newConfig, null, 4));
        cachedConfig = newConfig;
        return newConfig;
    }
};

async function promptForConfig(): Promise<Config> {
    function getExtFiles(dir: string, extensions: string[]): Promise<{value: string}[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    const zipFiles = files.filter(file => extensions.includes(path.extname(file))).map(file => ({ value: file }));
                    resolve(zipFiles);
                }
            });
        });
    }

    const zipFiles = await getExtFiles(process.cwd(), ['.zip']);

    if (!zipFiles.length) {
        throw new Error("No zip files found in current directory. Please provide a pack to remap.");
    }

    let inputJavaPack = zipFiles.length === 1 ? zipFiles[0].value : 
        await select({ 
            message: "Input Java Pack:",
            choices: zipFiles
        });
    let startCharcter: string | null = '\ue200';
    let maxIgnoreCharacter: string | null = '\u007f';

    let confirmed = false;

    while (!confirmed) {
        statusMessage(
            MessageType.Plain, 
            `Input Java Pack: ${inputJavaPack}`,
            `Start Character: ${startCharcter} (${unicode.escapeSequence(startCharcter)})`,
            `Max Ignore Character: ${maxIgnoreCharacter} (${unicode.escapeSequence(maxIgnoreCharacter)})`,
            ''
        );

        confirmed = await confirm({ message: 'Are these settings correct:' });

        if (!confirmed) {
            const fieldToEdit = await select({
                message: 'Which field would you like to edit?',
                choices: [
                    { name: 'Input Java Pack', value: 'inputJavaPack' },
                    { name: 'Start Character', value: 'startCharcter' },
                    { name: 'Max Ignore Character', value: 'maxIgnoreCharacter' }
                ]
            });

            switch (fieldToEdit) {
                case 'inputJavaPack':
                    inputJavaPack = await select({ 
                        message: "Input Java Pack:",
                        choices: await getExtFiles(process.cwd(), ['.zip'])
                    });
                    break;
                case 'startCharcter':
                    startCharcter = await input({ message: "Start Character:", default: '\ue200' });
                    break;
                case 'maxIgnoreCharacter':
                    maxIgnoreCharacter = await input({ message: "Max Ignore Character:", default: '\u007f' });
                    break;
                default:
                    throw new Error(`Unknown field ${fieldToEdit}`);
            }
        }
    }

    return {
        ...defaultConfig,
        inputJavaPack,
        startCharcter,
        maxIgnoreCharacter
    };
}