import { REELS, symbolCount, reelLENGTH } from "./modules/cons.js";
// reelLENGTH = primary + secondary

const setupclass = {
    randProp : function(symbolCount){
        const keys = Object.keys(symbolCount);
        const index = Math.floor(Math.random() * keys.length);
    
        symbolCount[keys[index]]--;
        if (symbolCount[keys[index]] == 0) 
            delete symbolCount[keys[index]];
    
        return keys[index];
    },
    appendLi : function(parent, symbolCount){
        const copy = JSON.parse(JSON.stringify(symbolCount));
        const symArr = [];

        const keys = Object.keys(symbolCount);
        const guarRows = keys.length;
        const randRows = Object.values(symbolCount).reduce((a, b) => a+b);

        // store first half in symArr
        for (let i = 0; i < guarRows + randRows; i++){
            if (i % 4 == 0 && i < 4*guarRows){ // add guaranteed row
                symArr[i] = keys[i/4];
            } else {
                symArr[i] = this.randProp(copy);
            }
        }

        // reelLENGTH = 2*(guar + rand)
        for (let i = 0; i < reelLENGTH; i++){
            const node = document.createElement("li");
            node.classList.add('cell');
            node.appendChild(document.createTextNode(symArr[i % (reelLENGTH/2)])); // (i % (reelLENGTH/2)) + " " + 
            parent.appendChild(node);
        }
    }
}
// ---------------------------------------------------------------------------------

// define constants
const stopped = []; // reels stopped?
const midSym = []; // the middle symbols, if stopped (from 1 to reelLength)
const spinPeriod = [10, 6, 3]; // period of each reel (reelLENGTH/2 cells take ... s)

const runclass = {
    cellHeight : 0,
    top_bottom : 0,
    // run only once
    init : function(cellHeight, top_bottom){
        this.cellHeight = cellHeight;
        this.top_bottom = top_bottom;
        
        const initialpos =  reelLENGTH/2; // symbol 7
        for (let i = 0; i < REELS; i++){
            stopped[i] = true;
            midSym[i] = initialpos;
        }
        $("ul.reels").css({top : `-${this.cellHeight * (midSym[0] - 1)}px`});
    },

    reset : function(reset_btn, levers){
        reset_btn.setAttribute("disabled", "");
        for (let i = 0; i < REELS; i++){
            stopped[i] = false;
            levers[i].removeAttribute("disabled");
            this.Spin(i, midSym[i], spinPeriod[i]);
        }
    },

    lever_pressed : function(reset_btn, levers, i){
        levers[i].setAttribute("disabled", "");
        const time_stop = this.stopSpin(reset_btn, i, spinPeriod[i]);

        setTimeout(() => {
            stopped[i] = true;
            let enable = true, win = true;
            for (let i = 0; i < REELS; i++){
                if (stopped[i] == false){
                    enable = false;
                    break;
                }
                if (i != 0 && midSym[i] != midSym[i-1])
                    win = false;
            }
            if (enable) {
                reset_btn.removeAttribute("disabled");
                if (win)
                    $("#result").text($("li.cell").eq(midSym[0]));
            }

        }, time_stop*1000);
    },

    Spin : function(i, pos_cur, period){
        // set from and to
        $(":root").css(`--startfrom-${i+1}`, `-${this.cellHeight*(pos_cur - 1)}px`);
        $(":root").css(`--startto-${i+1}`, '0px');

        // time to top
        const t_to_top = (pos_cur - 1) * period / (reelLENGTH/2);

        $("ul.reels").eq(i).css({
            animation: `start_scroll_${i+1} ${t_to_top}s linear,
                        bottom_to_top ${period}s linear ${t_to_top}s infinite`
        });
    },

    stopSpin : function(reset_btn, i, period){
        // for cubic bezier timing function
        let rate_cb = 3;

        // get pos next
        const top_cur = parseFloat($("ul.reels").eq(i).css('top'));
        const pos_cur = 1 + Math.floor((-top_cur) / this.cellHeight);
        // 3 cells from cur until next
        const delay = 3;
        let pos_next = pos_cur - delay;
        let top_next = -this.cellHeight * (pos_next - 1);
    
        let t_overall;

        if (pos_next < 1){
            pos_next += reelLENGTH/2;
            top_next = -this.cellHeight * (pos_next - 1);

            $(":root").css(`--acrossfrom-${i+1}`, `${top_cur}px`);
            $(":root").css(`--stopfrom-${i+1}`, `${this.top_bottom}px`);
            $(":root").css(`--stopto-${i+1}`, `${top_next}px`);

            const t_across = (-top_cur/this.cellHeight) * period / (reelLENGTH/2);
            t_overall = t_across + rate_cb * ((top_next - this.top_bottom)/this.cellHeight) * period / (reelLENGTH/2);
        
            $("ul.reels").eq(i).css({
                animation: `across_scroll_${i+1} ${t_across}s linear, 
                            stop_scroll_${i+1} ${t_overall - t_across}s 
                            cubic-bezier(${1/rate_cb},1,.85,1.1) ${t_across}s forwards`
            });
        }
        else {
            t_overall = rate_cb * ((top_next - top_cur)/this.cellHeight) * period / (reelLENGTH/2);

            $(":root").css(`--stopfrom-${i+1}`, `${top_cur}px`);
            $(":root").css(`--stopto-${i+1}`, `${top_next}px`);

            $("ul.reels").eq(i).css({
                animation: `stop_scroll_${i+1} ${t_overall}s
                            cubic-bezier(${1/rate_cb},1,.85,1.1) forwards`
            });
        }
        midSym[i] = pos_next;
        return t_overall;
    }
}

// ---------------------------------------------------------------------------------

// main
$(function(){

// setup slots
const container = document.getElementById("container");
for (let i = 0; i < REELS; i++){
    const slots = document.createElement("div");
    slots.setAttribute("class", "slots");

    const ul = document.createElement("ul");
    ul.setAttribute("class", "reels");
    setupclass.appendLi(ul, symbolCount);

    slots.appendChild(ul);
    container.appendChild(slots);
}

// get elements
const reel_slots = document.querySelectorAll("ul.reels");
const cells = document.querySelectorAll("li.cell");
const levers = document.querySelectorAll(".lever button");
const reset_btn = document.getElementById("reset-btn");

// define keyframes
$.keyframe.define([
    {
        name: 'bottom_to_top',
        from: {
            top: `${-cells[0].offsetHeight * reelLENGTH/2}px`
        },
        to: {
            top: '0px'
        }
    },
    {
        name: 'start_scroll_1',
        from: {
            top: `var(--startfrom-1)`
        },
        to: {
            top: 'var(--startto-1)'
        }
    },
    {
        name : 'start_scroll_2',
        from: {
            top: `var(--startfrom-2)`
        },
        to: {
            top: `var(--startto-2)`
        }
    },
    {
        name : 'start_scroll_3',
        from: {
            top: `var(--startfrom-3)`
        },
        to: {
            top: `var(--startto-3)`
        }
    },
    {
        name: 'stop_scroll_1',
        from: {
            top: 'var(--stopfrom-1)'
        },
        to: {
            top: 'var(--stopto-1)'
        }
    },
    {
        name: 'stop_scroll_2',
        from: {
            top: 'var(--stopfrom-2)'
        },
        to: {
            top: 'var(--stopto-2)'
        }
    },
    {
        name: 'stop_scroll_3',
        from: {
            top: 'var(--stopfrom-3)'
        },
        to: {
            top: 'var(--stopto-3)'
        }
    },
    {
        name: 'across_scroll_1',
        from: {
            top: 'var(--acrossfrom-1)'
        },
        to: {
            top: '0px'
        }
    },
    {
        name: 'across_scroll_2',
        from: {
            top: 'var(--acrossfrom-2)'
        },
        to: {
            top: '0px'
        }
    },
    {
        name: 'across_scroll_3',
        from: {
            top: 'var(--acrossfrom-3)'
        },
        to: {
            top: '0px'
        }
    }
]);

// init
runclass.init(cells[0].offsetHeight, -cells[0].offsetHeight * reelLENGTH/2);

// reset click
reset_btn.addEventListener("click", () => runclass.reset(reset_btn, levers));

// levers click
for (let i = 0; i < REELS; i++){
    levers[i].addEventListener("click", () => runclass.lever_pressed(reset_btn, levers, i))
}

});