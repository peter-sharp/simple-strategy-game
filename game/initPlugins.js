export default function initPlugins(plugins = []) {
    return plugins.reduce(function sortByFunctionality(sorted, x) {
        const [renderers, reducers] = sorted
        const xRenderers = x.renderers || []
        const xReducers = x.reducers || []
        return [[...renderers, ...xRenderers], [...reducers, ...xReducers]]
    }, [[], []])
}