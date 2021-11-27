export default function getByProp(prop, xs, value) {
    return xs.find(x => x[prop] == value)
}