export default function initPlugins(plugins = []) {
    return plugins.reduce(function sortByFunctionality(sorted, plugin) {
        const [renderers = [], reducers = [], controllers = []] = sorted
        let x;
        try {
            x = plugin()
        } catch(e) {
            x = plugin
        }
        const xRenderers = x.renderers || []
        const xReducers = x.reducers || []
        const xControllers = x.controllers || []
        return [[...renderers, ...xRenderers], [...reducers, ...xReducers], [...controllers, ...xControllers]]
    }, [[], [], []])
}