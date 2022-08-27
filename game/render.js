import getByProp from "./getByProp.js";
import getTile from './getTile.js';

const getByTeamColor = getByProp.bind(null, 'teamColor');


export default function render(context, HUD, renderers, state) {
    //layers 
    function renderTerrain(state, renderers) {

        const cols = state.cols;
        const rows = state.rows;
        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const pos = [x, y];
                const tile = getTile(state.terrain, cols, pos);
                try {
                    renderers[tile](context, { pos, size: state.tileSize })
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }
    function renderObjects(state, renderers) {
        for (let obj of state.objects) {
            const pos = obj.pos;
            try {
                renderers[obj.type](context, { size: state.tileSize, ...obj })
            } catch (e) {
                console.error(e)
            }
        }
    }

    function renderHUD(state, renderers) {

        for (let child of Array.from(HUD.children)) {
            if (child.matches('[data-messagebox]')) {
                child.innerText = '';
                child.dataset.state = 'hide';

            } else {
                HUD.removeChild(child)

            }
        }
        for (let obj of state.objects) {
            if (obj.teamColor != state.currentTurn) continue;
            try {
                renderers.unitButton(HUD, {
                    size: state.tileSize,
                    isSelected: state.selectedUnit == obj.id,
                    ...obj
                })
            } catch (e) {
                console.error(e)
            }
        }
        for (let ctrl of state.HUDControls) {

            try {
                renderers[ctrl.type](HUD, {
                    size: state.tileSize,
                    ...ctrl
                })
            } catch (e) {
                console.error(e)
            }
        }
        if (state.winner) {
            const victoryMessage = document.getElementById('victoryMessage');
            const winningPlayer = getByTeamColor(state.players, state.winner);
            victoryMessage.dataset.state = 'show'
            victoryMessage.innerText = `${winningPlayer.name} wins!`;
            victoryMessage.style.setProperty('--color', winningPlayer.teamColor);
        }

        // turn HUD
        const currentTurnPlayer = getByTeamColor(state.players, state.currentTurn);
        if(currentTurnPlayer){
            document.getElementById('currentTurnPlayerName').innerText = `${currentTurnPlayer.name}'s`;
            document.getElementById('gameFooter').style.setProperty('--color', currentTurnPlayer.teamColor);
        }

    }

    renderTerrain(state, renderers.terrain)
    renderObjects(state, renderers.objects)
    renderHUD(state, renderers.HUD)
}