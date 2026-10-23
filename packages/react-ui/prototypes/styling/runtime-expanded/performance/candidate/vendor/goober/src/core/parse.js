// PRIVATE EXPERIMENTAL PATCH to Goober 2.1.19. Preserve delimiters inside
// functional selectors/attributes/quoted strings when expanding nesting.
function list(value) {
    const out = []; let start = 0, round = 0, square = 0, quote = '', escape = false;
    for (let i = 0; i < value.length; i++) {
        const c = value[i];
        if (escape) { escape = false; continue; }
        if (c === '\\') { escape = true; continue; }
        if (quote) { if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === '(') round++; else if (c === ')') round--;
        else if (c === '[') square++; else if (c === ']') square--;
        else if (c === ',' && round === 0 && square === 0) { out.push(value.slice(start, i).trim()); start = i + 1; }
    }
    out.push(value.slice(start).trim()); return out;
}
function nesting(value, parent) {
    let out = '', quote = '', escape = false, found = false;
    for (const c of value) {
        if (escape) { out += c; escape = false; continue; }
        if (c === '\\') { out += c; escape = true; continue; }
        if (quote) { out += c; if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'") { quote = c; out += c; continue; }
        if (c === '&') { out += parent; found = true; } else out += c;
    }
    return found ? out : parent ? parent + ' ' + out : out;
}
function expand(parent, child) { return list(parent).flatMap(p => list(child).map(c => nesting(c, p))).join(','); }

/**
 * Parses the object into css, scoped, blocks
 * @param {Object} obj
 * @param {String} selector
 * @param {String} wrapper
 */
export let parse = (obj, selector) => {
    let outer = '';
    let blocks = '';
    let current = '';

    for (let key in obj) {
        let val = obj[key];

        if (key[0] == '@') {
            // If these are the `@` rule
            if (key[1] == 'i') {
                // Handling the `@import`
                outer = key + ' ' + val + ';';
            } else if (key[1] == 'f') {
                // Handling the `@font-face` where the
                // block doesn't need the brackets wrapped
                blocks += parse(val, key);
            } else {
                // Regular at rule block
                blocks += key + '{' + parse(val, key[1] == 'k' ? '' : selector) + '}';
            }
        } else if (typeof val == 'object') {
            // Call the parse for this block
            blocks += parse(
                val,
                selector
                    ? // Go over the selector and replace the matching multiple selectors if any
                      expand(selector, key)
                    : key
            );
        } else if (val != undefined) {
            // Convert all but CSS variables
            key = key[1] == '-' ? key : key.replace(/[A-Z]/g, '-$&').toLowerCase();
            // Push the line for this property
            current += parse.p
                ? // We have a prefixer and we need to run this through that
                  parse.p(key, val)
                : // Nope no prefixer just append it
                  key + ':' + val + ';';
        }
    }

    // If we have properties apply standard rule composition
    return outer + (selector && current ? selector + '{' + current + '}' : current) + blocks;
};
