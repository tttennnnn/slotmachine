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

const count = Object.values(symbolCount).reduce((a, b) => a + b);


const randProp = () => {
    const keys = Object.keys(copy);
    const index = Math.floor(Math.random() * keys.length);
    console.log(index);
    copy[keys[index]]--;
    console.log(copy);
    return keys[index];
}

const copy = JSON.parse(JSON.stringify(symbolCount));
// console.log(randProp());

const x = ({} == NaN);
console.log(x);