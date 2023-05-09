const REELS = 3;

const symbolCount = {
    "A" : 2,
    "J" : 3,
    "Q" : 3,
    "K" : 3,
    "7" : 1,
    "69" : 1,
    "LOL" : 2,
    "LMAO" : 2,
    "JK" : 2,
}

// const reelLength = Object.values(symbolCount).reduce((a, b) => a + b);

// get random property
const randProp = (symbolCount) => {
    const keys = Object.keys(symbolCount);
    const index = Math.floor(Math.random() * keys.length);

    symbolCount[keys[index]]--;
    if (symbolCount[keys[index]] == 0) 
        delete symbolCount[keys[index]];

    return keys[index];
}

// append li items
const createReels = (parent) => {
    const copy = JSON.parse(JSON.stringify(symbolCount));

    while (Object.keys(copy).length > 0){
        const node = document.createElement("li");
        node.classList.add('cell')
        node.appendChild(document.createTextNode(randProp(copy)));
        parent.appendChild(node);
    }
}

// add reels to HTML
const slots = document.getElementById("slots");
for (let i = 0; i < REELS; i++){
    const ul = document.createElement("ul");
    createReels(ul);
    slots.appendChild(ul);
}

