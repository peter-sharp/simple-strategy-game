const plugin = {
    reducers: [
        function logState(state, event) {
            console.info(event)
            console.debug(state)
            return state
        }
    ]
}

export default plugin