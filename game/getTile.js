export default function getTile(map, cols, [x, y]) {
    return map[y * cols + x]
}