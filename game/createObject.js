export default function createObject(type, data = {}) {
    createObject.id += 1
    const { id } = createObject;
    let obj = { id, type, pos: [0, 0], state: 'alive' }
    switch (type) {
        case 'soldier':
            //movement: [...terrain types]
            obj = { ...obj, destructable: true, movement: [1], moves: 1, maxMoves: 1, movesRegenRate: 1, attack: 0.2, defense: 0.5, ...data }
            break;
        case 'village':
            obj = { ...obj, capturable: true, moves: 1, maxMoves: 1, movesRegenRate: 0.5, ...data }
            break;
        default:
            obj = { ...obj, ...data }
            break;
    }
    return obj
}
createObject.id = 0;