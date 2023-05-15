export { REELS, symbolCount, reelLENGTH };

const REELS = 3;

const symbolCount = {
    "A" : 3,
    "J" : 3,
    "Q" : 3,
    "K" : 3,
    "7" : 1,
    "69" : 1,
    "LOL" : 4,
    "LMAO" : 4,
    "NAH" : 6,
}

const guar = Object.keys(symbolCount).length;
const rand = Object.values(symbolCount).reduce((a, b) => a+b);

// times 2 to add secondary for infinite scroll
const reelLENGTH = 2*(guar + rand);