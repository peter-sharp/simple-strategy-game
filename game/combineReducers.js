export default function combineReducers(fns) {
    return function combinedReduce(state, event) {
        let newState = state
        for (const fn of fns) {
          newState = fn(newState, event)  
        }
        return newState
    }
}