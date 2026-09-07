export function shuffleArray(arr) {
    const result = [...arr];   // copy to avoid changing the original
    let i = result.length;     // start from the end

    while (i > 0) {
        const j = Math.floor(Math.random() * i); // random index from 0 to i-1
        i--;                                     // move backward
        [result[i], result[j]] = [result[j], result[i]]; // swap
    }

    return result;
}
