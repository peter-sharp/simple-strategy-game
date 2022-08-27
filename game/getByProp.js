/**
 * Return item in given array with given prop matching given value
 * @param {String} prop 
 * @param {Array} xs 
 * @param {*} value 
 * @returns {Object}
 */
export default function getByProp(prop, xs, value) {
    return xs.find(x => x[prop] == value)
}