import getByProp from './getByProp.js';
import getTile from './getTile.js';
import createObject from './createObject.js';

const getById = getByProp.bind(null, 'id');

function extractById(objs, id) {
    const without = []
    let selected = null;
    for (let obj of objs) {
        if (obj.id == id) selected = obj;
        else without.push(obj);
    }
    return [selected, without];
}

const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
];

function randPick(xs) {
    return xs[Math.floor(Math.random() * xs.length)]
}


function collided(a, b) {
    return a.pos[0] == b.pos[0] && a.pos[1] == b.pos[1]
}

function isSameObject(a, b) {
    return a.id == b.id
}

function nextPlayer(players, teamColor) {
    const i = players.findIndex(x => x.teamColor == teamColor)
    return players[(i + 1) % players.length];
}

export default function updateGameState(state, event) {

    // remove destroyed objects
    state.objects = state.objects.filter(x => x.state != 'destroyed')

    switch (event.type) {
        case 'init':
            state.currentTurn = randPick(state.players).teamColor;
            break;
        case 'endTurn':
            const currentTurnPlayer = nextPlayer(state.players, state.currentTurn)
            state.currentTurn = currentTurnPlayer.teamColor;

            // restore unit moves
            state.objects = state.objects.map(
                x => 'moves' in x &&
                    x.teamColor == state.currentTurn &&
                    x.moves < x.maxMoves ?
                    { ...x, moves: x.moves + x.movesRegenRate } :
                    x
            )
            break;
        case 'moveUnit':
            let newObjects = state.objects.map(function moveUnit(x) {
                let pos = x.pos;
                let moves = x.moves
                if (x.id == state.selectedUnit && x.movement && moves >= 1) {
                    const [px, py] = x.pos;

                    const [dx, dy] = event.direction;
                    pos = [px + dx, py + dy]
                    moves -= 1;
                    if (!x.movement.includes(getTile(state.terrain, state.cols, pos))) {
                        pos = x.pos;
                        moves = x.moves;
                    }
                }
                return { ...x, pos, moves }
            })
            let objA = getById(newObjects, state.selectedUnit);
            // handle collisions
            if (objA) {
                newObjects = newObjects.reduce(function handleCollisions(xs, x) {
                    if (isSameObject(objA, x)) {
                        return xs;
                    }

                    if (collided(objA, x)) {

                        if (x.capturable) {
                            x = { ...x, teamColor: objA.teamColor };
                        } else if (
                            objA.state == 'alive' && x.state == 'alive' &&
                            objA.destructable && x.destructable
                        ) {
                            const aWon = (objA.attack + Math.random()) > x.defense;
                            if (aWon) {
                                x = { ...x, state: 'destroyed' }
                            } else {
                                objA = { ...objA, state: 'destroyed' }
                            }

                        }
                    }
                    return xs.concat(x)
                }, [])
                newObjects.push(objA)
            }

            state = {
                ...state,
                objects: newObjects,
                HUDControls: [],
                selectedUnit: null
            }
            break;
        case 'unitAction':
            if (state.selectedUnit != event.id) {
                // select unit
                const selectedUnit = event.id;
                const selectedUnitObj = getById(state.objects, selectedUnit);
                if (selectedUnitObj && selectedUnitObj.state != 'destroyed') {
                    state = { ...state, selectedUnit };
                    // show action controls
                    let HUDControls = [];
                    if (selectedUnitObj.movement && selectedUnitObj.moves) {

                        let id = 0;
                        for (let direction of directions) {
                            const pos = [
                                selectedUnitObj.pos[0] + direction[0],
                                selectedUnitObj.pos[1] + direction[1],
                            ];
                            if (!selectedUnitObj.movement.includes(getTile(state.terrain, state.cols, pos))) {
                                continue;
                            }
                            HUDControls = [
                                ...HUDControls,
                                { id, type: 'destinationButton', pos, direction }
                            ];
                            id += 1;
                        }

                    }
                    state = { ...state, HUDControls };
                }
            } else if (state.selectedUnit && state.selectedUnit.state != 'destroyed') {
                // unit action
                let [unit, newObjects] = extractById(state.objects, event.id);
                switch (unit.type) {
                    case 'village':
                        if (unit.teamColor && unit.moves >= 1) {
                            const dir = randPick(directions);
                            const soldier = createObject('soldier', {
                                pos: [unit.pos[0] + dir[0], unit.pos[1] + dir[1]],
                                teamColor: unit.teamColor,
                            });
                            newObjects = [...newObjects, soldier];
                            unit = { ...unit, moves: unit.moves - 1 }
                        }
                        break;

                    default:
                        break;
                }
                state.objects = [...newObjects, unit];
            }
            break;
        default:
            break;
    }

    // check winning conditions
    const newPlayers = []
    for (let player of state.players) {
        player = {
            ...player,
            unitCount: state.objects.reduce((count, x) => count + (x.teamColor == player.teamColor), 0)
        }
        if (player.unitCount) {
            newPlayers.push(player)
        };
    }
    state.players = newPlayers

    if (state.players.length == 1) {
        const [player] = state.players;
        state.winner = player.teamColor;
    }

    return state;
}