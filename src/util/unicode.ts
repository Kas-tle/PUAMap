export function escapeSequence(inputChar: string): string {
    let codePoint = inputChar.codePointAt(0);
    if (codePoint === undefined) {
        return 'Invalid character';
    }

    // For characters in the BMP
    if (codePoint <= 0xFFFF) {
        return "\\u" + codePoint.toString(16).padStart(4, '0');
    }

    // For characters outside the BMP
    return "\\u{" + codePoint.toString(16) + "}";
}

export function aboveChar(inputChar: string, compareChar: string): boolean {
    const codePoint = inputChar.codePointAt(0);
    if (codePoint === undefined) {
        throw new Error('Invalid character');
    }

    const compareCodePoint = compareChar.codePointAt(0);
    if (compareCodePoint === undefined) {
        throw new Error('Invalid character');
    }

    return codePoint > compareCodePoint;
}

export function nextChar(inputChar: string): string {
    // Convert the escape sequence to a code point
    let codePoint = inputChar.codePointAt(0);

    if (codePoint === undefined) {
        throw new Error('Invalid character');
    }

    // Increment the code point to get the next character
    codePoint++;

    // Convert back to a Unicode character
    return String.fromCodePoint(codePoint);
}

export function surrogates(inputChar: string): string {
    const codePoint = inputChar.codePointAt(0);
    if (codePoint === undefined || codePoint <= 0xFFFF) {
        // No surrogates needed for BMP characters
        return "No surrogates needed";
    }

    // Calculate surrogates
    const highSurrogate = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
    const lowSurrogate = ((codePoint - 0x10000) % 0x400) + 0xDC00;

    return `\\u${highSurrogate.toString(16)}\\u${lowSurrogate.toString(16)}`;
}