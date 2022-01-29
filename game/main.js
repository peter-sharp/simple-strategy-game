import renderers from './renderers.js';
import render from './render.js';
import model from './model.js';
import delegate from './delegate.js';
import updateGameState from './updateGameState.js';
import createObject from './createObject.js';
import combineReducers from './combineReducers.js';
import initPlugins from './initPlugins.js';

const initialState = {
    cols: 7,
    rows: 7,
    tileSize: 64,
    selectedUnit: null,
    terrain: [
        1, 2, 2, 0, 1, 2, 2,
        1, 1, 1, 0, 1, 1, 2,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        2, 1, 1, 0, 1, 1, 1,
        2, 2, 1, 0, 2, 2, 1,
    ],

    objects: [
        createObject('village', { pos: [1, 2] }),
        createObject('village', { pos: [1, 4] }),
        createObject('village', { pos: [5, 2] }),
        createObject('village', { pos: [5, 4] }),
        createObject('soldier', { pos: [0, 3], teamColor: '#f31' }),
        createObject('soldier', { pos: [6, 3], teamColor: '#13b' }),
    ],

    players: [
        { name: 'red', teamColor: '#f31' },
        { name: 'blue', teamColor: '#13b' },
    ],

    HUDControls: []
}

function gameController(emit, game) {
    game.addEventListener('click', delegate('[data-unit-button]', function unitAction(ev) {
        emit({ type: 'unitAction', id: parseInt(ev.target.dataset.id, 10) });
    }))

    game.addEventListener('click', delegate('[data-destination-button]', function moveUnit(ev) {
        emit({
            type: 'moveUnit',
            direction: ev.target.dataset.direction.split(',').map(x => parseInt(x, 10))
        });
    }))

    game.addEventListener('click', delegate('button[name="endTurn"]', function endTurn() {
        emit({
            type: 'endTurn'
        });
    }))

    const keyMappings = {
        'ArrowLeft': { type: 'moveUnit', direction: [-1, 0] },
        'ArrowRight': { type: 'moveUnit', direction: [1, 0] },
        'ArrowUp': { type: 'moveUnit', direction: [0, -1] },
        'ArrowDown': { type: 'moveUnit', direction: [0, 1] }
    }

    window.addEventListener('keyup', function handleShortcut(ev) {
        if (ev.key in keyMappings) {
            emit(keyMappings[ev.key])
        }
    })


    emit({ type: 'init' })
}

export default function init({plugins= []} = {}) {

    
    const [_renderers = [], reducers = [], controllers = []] = initPlugins(plugins)

    const [listen, emit] = model(initialState, combineReducers([...reducers, updateGameState]))
    
    controllers.push(gameController);

    const ctx = document.getElementById('gameBoard').getContext('2d');
    const HUD = document.getElementById('HUD')
    const game = document.getElementById('game')
    
    
    listen(render.bind(null, ctx, HUD, renderers))
    
    for (const controller of controllers) {
        controller(emit, game);
    }
  
}
