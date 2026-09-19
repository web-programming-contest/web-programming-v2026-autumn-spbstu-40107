export function analyzieString(str) {
    let length;

    if (typeof str == 'number') {
        str = str.toString();
        length = str.length;
    } else {
        length = str.length;
    }

    var letterPattern = /\p{L}/u;
    var digPattern = /[0-9]/;
    let letterCount = 0;
    let digCount = 0;
    let spaceCount = 0;
    let othCount = 0;

    for (let i = 0; i < length; ++i) {
        if (letterPattern.test(str[i]) == true) {
            letterCount++;
        }

        else if (digPattern.test(str[i]) == true) {
            digCount++;
        }

        else if (str[i] == ' ') {
            spaceCount++;
        }

        else {
            othCount++;
        }
    }

    return {letters: letterCount, digits: digCount, spaces: spaceCount, other: othCount};
}