export default function delegate(selector, fn) {
    return function delegateHandler(ev) {
        if (ev.target.matches(selector)) {
            fn.call(this, ev)
        }
    }
}