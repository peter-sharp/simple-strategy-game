
function model(initialState = {}, reducer) {
    const observers = []
    let state = {...initialState}

    function listen(cb) {
        observers.push(cb)
    }

    function update(state) {
        for(let observer of observers) {
            observer(state)
        }
    }

    function emit(event){
        
        state = reducer(state, event)
        update(state)
    }

    return [listen, emit]
}

function createObject(type, data = {}) {
    createObject.id += 1
    const { id } = createObject;
    let obj = { id, type, pos: [0, 0], state: 'alive' }
    switch (type) {
        case 'soldier':
            //movement: [...terrain types]
            obj = { ...obj, destructable: true, movement: [1], moves: 1, maxMoves: 1, movesRegenRate: 1, attack: 0.2, defense: 0.5, ...data}
            break;
        case 'village':
            obj = { ...obj, capturable: true, moves: 1, maxMoves: 1, movesRegenRate: 0.5, ...data}
            break;
        default:
            obj = { ...obj, ...data }
            break;
    }
    return obj
}
createObject.id = 0;

const initialState = {
    cols: 7,
    rows: 7,
    tileSize: 64,
    selectedUnit: null,
    terrain: [
        1,1,1,0,1,1,1,
        1,1,1,0,1,1,1,
        1,1,1,1,1,1,1,
        1,1,1,0,1,1,1,
        1,1,1,1,1,1,1,
        1,1,1,0,1,1,1,
        1,1,1,0,1,1,1,
    ],

    objects: [
        createObject('village', { pos: [1,2]}),
        createObject('village', { pos: [1,4]}),
        createObject('village', { pos: [5,2]}),
        createObject('village', { pos: [5,4]}),
        createObject('soldier', { pos: [0,3], teamColor: '#f31' }),
        createObject('soldier', { pos: [6,3], teamColor: '#13b' }),
    ],

    players: [
        { name:'red', teamColor: '#f31'},
        { name: 'blue', teamColor: '#13b'},
    ],

    HUDControls: []
}

function getByProp(prop, xs, value) {
    return xs.find(x => x[prop] == value)
}
const getById = getByProp.bind(null, 'id');
const getByTeamColor = getByProp.bind(null, 'teamColor');

function extractById(objs, id) {
    const without = []
    let selected = null;
    for(let obj of objs) {
        if(obj.id == id) selected = obj;
        else without.push(obj);
    }
    return [selected, without];
}

const directions = [
    [0,  1],
    [1,  0],
    [0, -1],
    [-1, 0],
];

function randPick(xs) {
    return xs[Math.floor(Math.random() * xs.length)]
}

function getTile(map, cols, [x, y]) {
    return map[y * cols + x]
}

function collided(a,b) {
    return a.pos[0] == b.pos[0] && a.pos[1] == b.pos[1]
}

function isSameObject(a,b) {
    return a.id == b.id
}

function nextPlayer(players, teamColor) {
    const i = players.findIndex(x => x.teamColor == teamColor)
    return players[(i + 1) % players.length];
}

function updateGameState(state, event) {

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
                x.moves < x.maxMoves  ? 
                { ...x, moves: x.moves + x.movesRegenRate } : 
                x
            )
            break;
        case 'moveUnit':
            let newObjects = state.objects.map(function moveUnit(x) {
                let pos = x.pos;
                let moves = x.moves
                if(x.id == state.selectedUnit && x.movement && moves >= 1) {
                    const [px, py] = x.pos;

                    const [dx, dy] = event.direction;
                    pos = [px + dx, py + dy]
                    moves -= 1;
                    if (!x.movement.includes(getTile(state.terrain, state.cols, pos))) {
                        pos = x.pos;
                        moves = x.moves;
                    }
                }
                return { ...x, pos, moves}
            })
            let objA = getById(newObjects, state.selectedUnit);
            // handle collisions
            if(objA) {
                newObjects = newObjects.reduce(function handleCollisions(xs, x) {
                    if (isSameObject(objA, x)) {
                        return xs;
                    }

                    if (collided(objA, x)) {
                        
                        if(x.capturable) {
                            x = {...x, teamColor: objA.teamColor};
                        } else if (
                            objA.state == 'alive' && x.state == 'alive' &&
                            objA.destructable && x.destructable
                            ) {
                            const aWon = (objA.attack + Math.random()) > x.defense;
                            if(aWon) {
                                x = { ...x, state: 'destroyed' }
                            } else {
                                objA = {...objA, state: 'destroyed' }
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
            if(state.selectedUnit != event.id) {
                // select unit
                const selectedUnit = event.id;
                const selectedUnitObj = getById(state.objects, selectedUnit);
                if (selectedUnitObj && selectedUnitObj.state != 'destroyed') {
                    state = {...state, selectedUnit};
                    // show action controls
                    let HUDControls = [];
                    if (selectedUnitObj.movement && selectedUnitObj.moves){
                        
                        let id = 0;
                        for(let direction of directions) {
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
                            id +=1;
                        }
                        
                    }
                    state = { ...state, HUDControls };
                }
            } else if (state.selectedUnit && state.selectedUnit.state != 'destroyed') {
                // unit action
                let [unit, newObjects] = extractById(state.objects, event.id);
                switch (unit.type) {
                    case 'village':
                        if(unit.teamColor && unit.moves >= 1) {
                            const dir = randPick(directions);
                            const soldier = createObject('soldier', {
                                pos: [unit.pos[0] + dir[0], unit.pos[1] + dir[1]], 
                                teamColor: unit.teamColor,
                            });
                            newObjects = [...newObjects, soldier];
                            unit = {...unit, moves: unit.moves - 1 }
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
    for(let player of state.players) {
        player = {
            ...player, 
            unitCount: state.objects.reduce((count, x) => count + (x.teamColor == player.teamColor), 0)
        }
        if(player.unitCount) {
            newPlayers.push(player)
        };
    }
    state.players = newPlayers

    if(state.players.length == 1) {
        const [player] = state.players;
        state.winner = player.teamColor;
    } 
    console.log(state)
    return state;
}

const renderers = {
    terrain: [
        function renderWater(ctx, { pos , size}) {
            const [x,y] = pos;
            ctx.fillStyle= '#37f'
            ctx.fillRect(x * size, y * size, size, size)

            const ripple = size * 0.25;
            ctx.fillStyle = '#3070ff'
            ctx.fillRect(x * size, y * size, size, ripple)

            ctx.fillRect(x * size, y * size + ripple * 2, size, ripple)
        },
        function renderGrass(ctx, { pos , size}) {
            const [x,y] = pos;
            ctx.fillStyle = '#1f5'
            ctx.fillRect(x * size, y* size, size, size)

            const checker = size * 0.25;
            ctx.fillStyle = '#11f955'
            let offset = 0;
            for(let cx = 0; cx < 4; cx+= 1) {
                for(let cy = 0; cy < 4; cy+= 2) {
                    ctx.fillRect(x * size + checker * cx, y * size + checker * (cy + offset), checker, checker)
                }
                offset = offset ? 0 : 1
            }
            

        }
    ],
    objects: {
        village: function renderVillage(ctx, { pos , size, teamColor = null }) {
            const [x,y] = pos;

            const wallsHeight = size * 0.8;
            const wallsWidth = size * 0.8;
            // shadow
            const shadowMargin = size * 0.1 / 2;
            const shadowHeight = size * 0.2
            ctx.fillStyle = '#00000022'
            ctx.fillRect(
                x * size + shadowMargin,
                y * size + wallsHeight - shadowMargin,
                wallsWidth + shadowMargin * 2,
                shadowHeight
            )

            // walls
           
            const wallsMargin = size * 0.2 / 2;
            ctx.fillStyle = '#fff'
            ctx.fillRect(
                x * size + wallsMargin, 
                y * size + wallsMargin, 
                wallsWidth, 
                wallsHeight
            )

            // roof
            const roofWidth = wallsWidth;
            const roofHeight = wallsHeight * 0.4;
            const roofMargin = wallsMargin;
            ctx.fillStyle = teamColor || '#fab'
            ctx.fillRect(
                x * size + roofMargin, 
                y * size + roofMargin, 
                roofWidth, 
                roofHeight
            )

            // door

            const doorWidth = wallsWidth * 0.2 ;
            const doorHeight = (wallsHeight - roofHeight) * 0.6;
            const doorMargin = wallsMargin * 2;
            ctx.fillStyle = '#ccc'
            ctx.fillRect(
                x * size + doorMargin, 
                y * size + (size - wallsMargin - doorHeight), 
                doorWidth, 
                doorHeight
            )
        },
        soldier: function renderSoldier(ctx, { pos , size, teamColor, state: unitState }) {
            const [x,y] = pos;
            const soldierWidth = size * 0.3;
            const soldierHeight = size * 0.8;
            const soldierMarginX = size * 0.7 / 2;
            
            // shadow
            const shadowMargin = size * 0.1 / 2;
            const shadowHeight = size * 0.2
            ctx.fillStyle = '#00000022'
            ctx.fillRect(
                x * size + soldierMarginX - shadowMargin,
                y * size + soldierHeight - shadowMargin,
                soldierWidth + shadowMargin * 2,
                shadowHeight
                )
            if (unitState != 'destroyed') {
                // body    
                const soldierMarginY = size * 0.2 / 2;
                ctx.fillStyle = teamColor || '#000'
                ctx.fillRect(
                    x * size + soldierMarginX,
                    y * size + soldierMarginY,
                    soldierWidth,
                    soldierHeight
                )
            }
        }
    },
    HUD: {
        unitButton: function renderUnitButton(HUD, { pos, size, id, isSelected, teamColor, moves }) {
            const btn = document.createElement('button');
            
            const [x,y] = pos;
            btn.classList.add('board-control');
            btn.classList.add('unit-control');
            btn.style.setProperty('--x', `${x * size}px`);
            btn.style.setProperty('--y', `${y * size}px`);
            btn.style.setProperty('--width', `${size}px`);
            btn.style.setProperty('--height', `${size}px`);
            if(moves >= 1) {
                btn.style.setProperty('--color', teamColor);
            }
            btn.setAttribute('id', `unitControl${id}`);
            btn.dataset.id = id;
            btn.dataset.unitButton = '';
            btn.dataset.isSelected = isSelected;
            HUD.appendChild(btn);
        },
        destinationButton: function renderDestinationButton(HUD, { id, size, pos, direction }) {
            const btn = document.createElement('button');
            
            const [x,y] = pos;
            btn.classList.add('board-control');
            btn.classList.add('destination-control');
            btn.style.setProperty('--x', `${x * size}px`);
            btn.style.setProperty('--y', `${y * size}px`);
            btn.style.setProperty('--width', `${size}px`);
            btn.style.setProperty('--height', `${size}px`);
            btn.setAttribute('id', `destinationControl${id}`);
            btn.dataset.direction = direction.join(',');
            btn.dataset.destinationButton = '';
            HUD.appendChild(btn);
        }
    }
}


function render(context, HUD, renderers, state) {
    //layers 
    function renderTerrain(state, renderers) {
      
        const cols = state.cols;
        const rows = state.rows;
        for(let y = 0; y < rows; y += 1) {
            for(let x = 0; x < cols; x += 1) {
                const pos = [x,y];
                const tile = getTile(state.terrain, cols, pos);
                try {
                    renderers[tile](context, { pos, size: state.tileSize })
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }
    function renderObjects(state, renderers) {
        for(let obj of state.objects) {
            const pos = obj.pos;
            try {
                renderers[obj.type](context, {size: state.tileSize, ...obj })
            } catch (e) {
                console.error(e)
            }
        }
    }

    function renderHUD(state, renderers) {
       
        for(let child of Array.from(HUD.children)) {
            if (child.matches('[data-messagebox]')) {
                child.innerText = '';
                child.dataset.state = 'hide';
                
            } else {
                HUD.removeChild(child)
                
            }
        }
        for(let obj of state.objects) {
           if(obj.teamColor != state.currentTurn) continue;
            try {
                renderers.unitButton(HUD, {
                    size: state.tileSize,
                    isSelected: state.selectedUnit == obj.id,
                    ...obj 
                })
            } catch (e) {
                console.error(e)
            }
        }
        for(let ctrl of state.HUDControls) {
           
            try {
                renderers[ctrl.type](HUD, {
                    size: state.tileSize,
                    ...ctrl
                })
            } catch (e) {
                console.error(e)
            }
        }
        if(state.winner) {
            const victoryMessage = document.getElementById('victoryMessage');
            const winningPlayer = getByTeamColor(state.players, state.winner);
            victoryMessage.dataset.state = 'show'
            victoryMessage.innerText = `${winningPlayer.name} wins!`;
            victoryMessage.style.setProperty('--color', winningPlayer.teamColor);
        }
        
        // turn HUD
        const currentTurnPlayer = getByTeamColor(state.players, state.currentTurn);
        document.getElementById('currentTurnPlayerName').innerText = `${currentTurnPlayer.name}'s`;
        document.getElementById('gameFooter').style.setProperty('--color', currentTurnPlayer.teamColor);

    }

    renderTerrain(state, renderers.terrain)
    renderObjects(state, renderers.objects)
    renderHUD(state, renderers.HUD)
}

function delegate(selector, fn) {
    return function delegateHandler(ev) {
        if(ev.target.matches(selector)) {
            fn.call(this, ev)
        }
    }
}

function main() {
    const [listen, emit] = model(initialState, updateGameState)
    const ctx = document.getElementById('gameBoard').getContext('2d');
    const HUD = document.getElementById('HUD')
    const game = document.getElementById('game')
    listen(render.bind(null, ctx, HUD, renderers))


    emit({ type: 'init' })



    game.addEventListener('click', delegate('[data-unit-button]', function unitAction(ev) {
        emit({ type: 'unitAction', id: parseInt(ev.target.dataset.id, 10) });
    }))

    game.addEventListener('click', delegate('[data-destination-button]', function moveUnit(ev) {
        emit({
            type: 'moveUnit',
            direction: ev.target.dataset.direction.split(',').map(x => parseInt(x, 10))
        });
    }))

    game.addEventListener('click', delegate('button[name="endTurn"]', function endTurn(ev) {
        emit({
            type: 'endTurn'
        });
    }))

    const keyMappings = {
        'ArrowLeft': { type:'moveUnit', direction: [-1, 0]},
        'ArrowRight': { type:'moveUnit', direction: [1, 0]},
        'ArrowUp': { type:'moveUnit', direction: [0, -1]},
        'ArrowDown': { type:'moveUnit', direction: [0, 1]}
    }

    window.addEventListener('keyup', function handleShortcut(ev) {
        console.log(ev.key);
        if(ev.key in keyMappings) {
            emit(keyMappings[ev.key])
        }
    })
}

main()