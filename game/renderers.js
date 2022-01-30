import getCenter from "./utils/getCenter.js";

const renderers = {
    terrain: [
        function renderWater(ctx, { pos, size }) {
            const [x, y] = pos;

            const offset = size * 0.1;
            const baseY = y * size + offset;
            ctx.fillStyle = '#37f'
            ctx.fillRect(x * size, baseY, size, size)

            stripe({ color:'#3070ff', dir: 'y', numStripes: 10 }, ctx, { abspos:[x* size, baseY], size })
        },
        function renderGrass(ctx, { pos, size }) {
            const [x, y] = pos;

            const sideOffset = size * 0.1;
            ctx.fillStyle = '#364';
            ctx.fillRect(x * size, y * size + sideOffset, size, size)

            ctx.fillStyle = '#1f5'
            ctx.fillRect(x * size, y * size, size, size)
            checker({ color: '#11f955', numCheckers: 4 }, ctx, { abspos: [x * size, y * size], size });
        },
        function renderForest(ctx, { pos, size }) {
            const [x, y] = pos;
            
            ctx.fillStyle = '#11a955';
            ctx.fillRect(x * size, y * size, size, size)
            
            ctx.fillStyle = '#175'
            const tenth = size * 0.1;
            ctx.fillRect(x * size, y * size - tenth, size, size)

            stripe({ color:'#163', dir: 'x', numStripes: 10 }, ctx, { abspos: [x * size, y * size - tenth], size})

            const halfSize = size * 0.5
            ctx.fillStyle = '#1a6'
            ctx.fillRect(x * size, y * size - halfSize, size, size)
            checker({ color: '#196', numCheckers: 8 }, ctx, { abspos: [x * size, y * size - halfSize], size })
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
            const soldierHeight = size * 0.6;
            const legsWidth = soldierWidth * 0.77;
            const sectionHeight = soldierHeight * 0.5;
            const headWidth = soldierWidth * 0.65;
            const headHeight = soldierHeight * 0.333;
            const soldierMarginX = size * 0.7 / 2;

            // shadow
            const shadowMargin = size * 0.1 / 2;
            const shadowHeight = size * 0.2
            ctx.fillStyle = '#00000022'
            ctx.fillRect(
                x * size + soldierMarginX - shadowMargin,
                y * size + soldierHeight - shadowMargin + headHeight,
                soldierWidth + shadowMargin * 2,
                shadowHeight
            )
            if (unitState != 'destroyed') {
                const soldierMarginY = size * 0.2 / 2;

                // legs    
                ctx.fillStyle = teamColor || '#000'
                const legsCenter = getCenter(soldierWidth, legsWidth);
                ctx.fillRect(
                    x * size + soldierMarginX + legsCenter,
                    y * size + soldierMarginY + headHeight + sectionHeight,
                    legsWidth,
                    sectionHeight
                )

                // body    
                ctx.fillStyle = teamColor || '#000'
                ctx.fillRect(
                    x * size + soldierMarginX,
                    y * size + soldierMarginY + headHeight,
                    soldierWidth,
                    sectionHeight
                )

                // head
                ctx.fillStyle =  '#a76'
                const headCenter = getCenter(soldierWidth, headWidth);
                ctx.fillRect(
                     x * size + headCenter + soldierMarginX,
                     y * size + soldierMarginY + size * 0.07,
                     headWidth,
                     headHeight
                )
                ctx.fillStyle = teamColor || '#000'
                ctx.fillRect(
                    x * size + headCenter + soldierMarginX,
                    y * size + soldierMarginY + size * 0.07,
                    headWidth,
                    headHeight * 0.5
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

function stripe({ color, numStripes, dir }, ctx, { abspos, size }) {
    const stripe = size / numStripes;
    ctx.fillStyle = color;
    const dirArgs = (dir, sD, [x, y], size) => dir == 'y' ? 
                      [x , y + stripe * sD, size, stripe] : 
                      [x + stripe * sD, y, stripe, size];

    for (let sD = 0; sD < numStripes; sD += 2) {
        const [x, y, width, height] = dirArgs(dir, sD, abspos, size);
        console.log({ color, x, y, width, height });
        ctx.fillRect(x, y, width, height)
    }
}

function checker({ color, numCheckers }, ctx, { abspos, size }) {

    ctx.fillStyle = color
    const checkerSize = size / numCheckers;
    const [x, y] = abspos;
    let offset = 0;
    for (let cx = 0; cx < numCheckers; cx += 1) {
        for (let cy = 0; cy < numCheckers; cy += 2) {
            ctx.fillRect(x + checkerSize * cx, y + checkerSize * (cy + offset), checkerSize, checkerSize)
        }
        offset = offset ? 0 : 1
    }
}

export default renderers