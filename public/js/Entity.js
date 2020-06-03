import {
    Vector2
} from "./math.js";
import BoundingBox from './BoundingBox.js';
import AudioBoard from "./AudioBoard.js";
import EventEmitter from "./EventEmitter.js";

export const SIDES = {
    TOP: Symbol('top'),
    BOTTOM: Symbol('bottom'),
    LEFT: Symbol('left'),
    RIGHT: Symbol('right')
};
export class Trait {
    constructor(name) {
        this.NAME = name;
        this.tasks = [];
        this.sounds = new Set();
        this.events = new EventEmitter();
    }
    finalize() {
        this.tasks.forEach(task => task());
        this.tasks.length = 0;
    }
    queue(task) {
        this.tasks.push(task);
    }
    collides(us, them) {}
    obstruct() {}
    playSounds(audioBoard, audioContext) {
        this.sounds.forEach(name => {
            audioBoard.playAudio(name, audioContext);
        });
        this.sounds.clear();
    }
    update() {}
}

export default class Entity {
    constructor() {
        this.audio = new AudioBoard();
        this.pos = new Vector2(0, 0);
        this.vel = new Vector2(0, 0);
        this.size = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
        this.bounds = new BoundingBox(this.pos, this.size, this.offset);
        this.lifetime = 0;
        this.traits = [];
    }
    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }
    obstruct(side, match) {
        this.traits.forEach(trait => {
            trait.obstruct(this, side, match);
        });
    }
    collides(candidate) {
        this.traits.forEach(trait => {
            trait.collides(this, candidate);
        });
    }
    draw() {}
    finalize() {
        this.traits.forEach(trait => {
            trait.finalize();
        });
    }
    update(gameContext, level) {
        this.traits.forEach(trait => {
            trait.update(this, gameContext, level);
            trait.playSounds(this.audio, gameContext.audioContext);
        });
        this.lifetime += gameContext.deltaTime;
    }
}