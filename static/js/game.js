// Set up the canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const character = {
    x: 50,
    y: 50,
    width: 20,
    height: 20,
    color: 'blue',
    speed: 5
};

const items = [
    { x: 100, y: 200, type: 'recyclable' },
    { x: 300, y: 150, type: 'compost' },
    { x: 500, y: 300, type: 'trash' }
];

function drawCharacter() {
    ctx.fillStyle = character.color;
    ctx.fillRect(character.x, character.y, character.width, character.height);
}

function drawItems() {
    items.forEach(item => {
        ctx.fillStyle = item.type === 'recyclable' ? 'green' : item.type === 'compost' ? 'brown' : 'gray';
        ctx.fillRect(item.x, item.y, 20, 20);
    });
}

function moveCharacter(direction) {
    if (direction === 'ArrowUp') character.y -= character.speed;
    if (direction === 'ArrowDown') character.y += character.speed;
    if (direction === 'ArrowLeft') character.x -= character.speed;
    if (direction === 'ArrowRight') character.x += character.speed;
    detectCollision();
    render();
}

function detectCollision() {
    items.forEach((item, index) => {
        if (character.x < item.x + 20 && character.x + character.width > item.x &&
            character.y < item.y + 20 && character.y + character.height > item.y) {
            openSortingScreen(item.type);  // Open sorting screen when item is collected
            items.splice(index, 1);        // Remove collected item
        }
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter();
    drawItems();
}

document.addEventListener('keydown', (e) => moveCharacter(e.key));
render();
