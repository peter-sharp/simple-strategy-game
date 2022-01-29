
const renderers = {
    terrain: [
        function renderWater(ctx, { pos, size }) {
            const [x, y] = pos;
            ctx.fillStyle = '#37f'
            ctx.fillRect(x * size, y * size, size, size)

            const ripple = size * 0.25;
            ctx.fillStyle = '#3070ff'
            ctx.fillRect(x * size, y * size, size, ripple)

            ctx.fillRect(x * size, y * size + ripple * 2, size, ripple)
        },
        function renderGrass(ctx, { pos, size }) {
            const [x, y] = pos;
            ctx.fillStyle = '#1f5'
            ctx.fillRect(x * size, y * size, size, size)

            const checker = size * 0.25;
            ctx.fillStyle = '#11f955'
            let offset = 0;
            for (let cx = 0; cx < 4; cx += 1) {
                for (let cy = 0; cy < 4; cy += 2) {
                    ctx.fillRect(x * size + checker * cx, y * size + checker * (cy + offset), checker, checker)
                }
                offset = offset ? 0 : 1
            }
        },
        function renderForest(ctx, { pos, size }) {
            const [x, y] = pos;
            
            ctx.fillStyle = '#11a955';
            ctx.fillRect(x * size, y * size, size, size)
            
            ctx.fillStyle = '#175'
            const tenth = size * 0.1;
            ctx.fillRect(x * size, y * size - tenth, size, size)

            const halfSize = size * 0.5
            ctx.fillStyle = '#1a6'
            ctx.fillRect(x * size, y * size - halfSize, size, size)
        }
    ],
    objects: {
        village: function renderVillage(ctx, { pos, size, teamColor = null }) {
            const [x, y] = pos;

            const wallsHeight = size * 0.8;
            const wallsWidth = size * 0.8;
            // shadow
            const shadowMargin = size * 0.1 / 2;
            const shadowHeight = size * 0.2
            ctx.fillStyle = '#00000022'
            ctx.fillRect(
                x * size + shadowMargin,
                y * size + wallsHeight - shadowMargin,
                wallsWidth + shadowMargin * 2,
                shadowHeight
            )

            // walls

            const wallsMargin = size * 0.2 / 2;
            ctx.fillStyle = '#fff'
            ctx.fillRect(
                x * size + wallsMargin,
                y * size + wallsMargin,
                wallsWidth,
                wallsHeight
            )

            // roof
            const roofWidth = wallsWidth;
            const roofHeight = wallsHeight * 0.4;
            const roofMargin = wallsMargin;
            ctx.fillStyle = teamColor || '#fab'
            ctx.fillRect(
                x * size + roofMargin,
                y * size + roofMargin,
                roofWidth,
                roofHeight
            )

            // door

            const doorWidth = wallsWidth * 0.2;
            const doorHeight = (wallsHeight - roofHeight) * 0.6;
            const doorMargin = wallsMargin * 2;
            ctx.fillStyle = '#ccc'
            ctx.fillRect(
                x * size + doorMargin,
                y * size + (size - wallsMargin - doorHeight),
                doorWidth,
                doorHeight
            )
        },
        soldier: function renderSoldier(ctx, { pos, size, teamColor, state: unitState }) {
            const [x, y] = pos;
            const soldierWidth = size * 0.3;
            const soldierHeight = size * 0.8;
            const soldierMarginX = size * 0.7 / 2;

            // shadow
            const shadowMargin = size * 0.1 / 2;
            const shadowHeight = size * 0.2
            ctx.fillStyle = '#00000022'
            ctx.fillRect(
                x * size + soldierMarginX - shadowMargin,
                y * size + soldierHeight - shadowMargin,
                soldierWidth + shadowMargin * 2,
                shadowHeight
            )
            if (unitState != 'destroyed') {
                // body    
                const soldierMarginY = size * 0.2 / 2;
                ctx.fillStyle = teamColor || '#000'
                ctx.fillRect(
                    x * size + soldierMarginX,
                    y * size + soldierMarginY,
                    soldierWidth,
                    soldierHeight
                )
            }
        }
    },
    HUD: {
        unitButton: function renderUnitButton(HUD, { pos, size, id, isSelected, teamColor, moves }) {
            const btn = document.createElement('button');

            const [x, y] = pos;
            btn.classList.add('board-control');
            btn.classList.add('unit-control');
            btn.style.setProperty('--x', `${x * size}px`);
            btn.style.setProperty('--y', `${y * size}px`);
            btn.style.setProperty('--width', `${size}px`);
            btn.style.setProperty('--height', `${size}px`);
            if (moves >= 1) {
                btn.style.setProperty('--color', teamColor);
            }
            btn.setAttribute('id', `unitControl${id}`);
            btn.dataset.id = id;
            btn.dataset.unitButton = '';
            btn.dataset.isSelected = isSelected;
            HUD.appendChild(btn);
        },
        destinationButton: function renderDestinationButton(HUD, { id, size, pos, direction }) {
            const btn = document.createElement('button');

            const [x, y] = pos;
            btn.classList.add('board-control');
            btn.classList.add('destination-control');
            btn.style.setProperty('--x', `${x * size}px`);
            btn.style.setProperty('--y', `${y * size}px`);
            btn.style.setProperty('--width', `${size}px`);
            btn.style.setProperty('--height', `${size}px`);
            btn.setAttribute('id', `destinationControl${id}`);
            btn.dataset.direction = direction.join(',');
            btn.dataset.destinationButton = '';
            HUD.appendChild(btn);
        }
    }
}

export default renderers