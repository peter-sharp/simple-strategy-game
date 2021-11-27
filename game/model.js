export default function model(initialState = {}, reducer) {
    const observers = []
    let state = { ...initialState }

    function listen(cb) {
        observers.push(cb)
    }

    function update(state) {
        for (let observer of observers) {
            observer(state)
        }
    }

    function emit(event) {

        state = reducer(state, event)
        update(state)
    }

    return [listen, emit]
}