


// Placeholder syntax: {{ paramName }} or {{ paramName? }} or {{ paramName.subParamName }} or {{ paramName.subParamName || 'default value' }}
export function hasPlaceholder(str: string) {
    const regex = /{{\s*[\w\.]+\s*}}/g;
    return regex.test(str.trim());
}

export  function onlyPlaceholder(str: string) {
    const regex = /^{{\s*[\w\.]+\s*}}$/g;
    return regex.test(str.trim());
}


// Call only if onlyPlaceholder returns true
// returns {paramName: string, required: boolean}
export function placeholderName(str: string) {

    const regex = /{{\s*([\w\.]+)\s*}}/g;
    const matches = regex.exec(str);
    if (matches) {
        const paramName = matches[1];
        const required = paramName.endsWith('?');
        return {
            paramName: paramName.replace('?', ''),
            required: required
        };
    }
    return undefined;

}


export function placeholderNames(str: string) {
    const regex = /{{\s*([\w\.]+)\s*}}/g;
    const matches = str.match(regex);
    if (matches) {
        return matches.map((m) => {
            return m.replace('{{', '').replace('}}', '').trim();
        });
    }
    return null;
}

