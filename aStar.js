// (() => {

    const c = document.getElementById("graph");
    const cc = c.getContext("2d");
    const w = c.width;
    const h = c.height;
    const start = document.getElementById("start");
    const obstacleBtn = document.getElementById("changeObstacles");
    obstacleBtn.disabled = true;
    const adjustSize = document.getElementById("adjustSize");
    adjustSize.disabled = true;
    let wallChance = document.getElementById("obstacleInput");

    let openSet = [];
    let closedSet = [];

    wallChance.addEventListener("input", (e) => {
        obstacleBtn.disabled = e.target.value.length <= 0;
    });

    obstacleBtn.addEventListener("click", () => {
        fillGridWithSpots(wallChance.value);
    });

    start.addEventListener("click", async () => {
        console.log("BEGIN");
        makeNeighbors();
        let t1 = performance.now();
        await aStar(grid);
        let t2 = performance.now();
        console.log(`Time elapsed : ${t2 - t1}`);
    });

    async function aStar(arr) {
        console.log("searching...");
        const len = arr.length;
        let start = arr[0][0];
        let goal = arr[len - 1][len - 1];
        openSet.push(start);

        // need to loop through the openSet and not seen and call the this.seen to display the different color
        while(openSet.length > 0) {

            await sleep(100);

            let best = 0;
            for(let i = 0; i < openSet.length; i++) {
                if(openSet[i].f < openSet[best].f) {
                    best = i;
                }
            }

            let current = openSet[best];

            if(current === goal) {
                console.log("Done");
                break;
            }

            closedSet.push(current);
            removeSpot(openSet, current);

            let currentNeighbors = current.neighbors;
            for(let i = 0; i < currentNeighbors.length; i++) {
                let neighbor = currentNeighbors[i];
                if(closedSet.indexOf(neighbor) >= 0) continue;
                let tentativeG = current.g + 1;
                if(openSet.indexOf(neighbor) >= 0) {
                    if(tentativeG < neighbor.g) {
                        neighbor.g = tentativeG;
                    }
                } else {
                    neighbor.g = tentativeG;
                    openSet.push(neighbor);
                }
                neighbor.h = heuristics(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
            }

        }

    }

    function heuristics(n, e) {
        let x = Math.abs(n.x - e.x);
        let y = Math.abs(n.y - e.y);
        return  Math.sqrt((x ** 2) + (y ** 2));
    }


    function removeSpot(arr, item) {
        for(let i = arr.length - 1; i >= 0; i--) {
            if(arr[i] === item) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    let grid = []; // 100 spots

    const rows = w / 10; // should make 10 spots with 80 x 80 size
    const cols = h / 10; // should make 10 spots with 80 x 80 size

    function fillGridWithSpots(wallChance){
        grid = [];
        for(let i = 0; i < 10; i++) {
            grid[i] = new Array(10);
        }
        let x = 0;
        let y = 0;
        for(let i = 0; i < w; i+=rows) {
            y = 0;
            for(let j = 0; j < h; j+=cols) {
                let isFirst = i === 0 && j === 0;
                let isLast = i === w - rows && j === h - cols;
                let ran = ~~(Math.random() * 100) + 1;
                let isWall = ran < wallChance && (!isFirst && !isLast);
                grid[x][y] = new Spot(i, j, isWall);
                y++;
            }
            x++;
        }
    }
    fillGridWithSpots(20);

    function Spot(x, y, isWall) {
        this.x = x;
        this.y = y;
        this.isWall = isWall;

        this.f = 0;
        this.g = 0;
        this.h = 0;

        this.neighbors = [];

        this.addNeighbors = function(grid) {
            let x = this.x / 80;
            let y = this.y / 80;
            let xMax = w / cols - 1;
            let yMax = h / rows - 1;
            if(x < xMax) { // hard coded for now
                this.neighbors.push(grid[x + 1][y]);
            }
            if(x > 0) {
                this.neighbors.push(grid[x - 1][y]);
            }
            if(y < yMax) { // hard coded for now
                this.neighbors.push(grid[x][y + 1]);
            }
            if(y > 0) {
                this.neighbors.push(grid[x][y - 1]);
            }
        }

        this.show = function() {
            if(this.isWall) {
                fill(this.x, this.y, w / 10, h / 10, "#0d0c0c");
            } else {
                hollowFill(this.x, this.y, w / 10, h / 10, "#3d51e7");
            }
        }

        this.start = function () {
            fill(this.x, this.y, w / 10, h / 10, "#a20303");
        }

        this.goal = function () {
            fill(this.x, this.y, w / 10, h / 10, "#07a307");
        }

        this.seen = function () {
            fill(this.x, this.y, w / 10, h / 10, "#f84c02");
        }

        this.looking = function () {
            fill(this.x, this.y, w / 10, h / 10, "#cf02f8");
        }

    }

    function createGrid() {
        grid[0][0].start();
        grid[grid[0].length - 1][grid.length - 1].goal();
        for(let i = 0; i < grid.length; i++) {
            for(let j = 0; j < grid[i].length; j++) {
                grid[i][j].show();
            }
        }
        for(let i = 0; i < openSet.length; i++) {
            openSet[i].seen();
        }
        for(let i = 0; i < closedSet.length; i++) {
            closedSet[i].looking();
        }

        grid[0][0].start();
        grid[grid[0].length - 1][grid.length - 1].goal();
    }

    function makeNeighbors(){
        for(let i = 0; i < grid.length; i++) {
            for(let j = 0; j < grid[i].length; j++) {
                grid[i][j].addNeighbors(grid);
            }
        }
    }





    setInterval(load, 450);
    function load(){
        draw();
    }
    function draw(){
        fill(0, 0, w, h, "#767676");
        createGrid();
    }
    function fill(x, y, w, h, c) {
        cc.fillStyle = c;
        cc.fillRect(x, y, w, h);
    }
    function hollowFill(x, y, w, h, c) {
        cc.strokeStyle = c;
        cc.lineWidth = 2;
        cc.strokeRect(x, y, w, h);
    }

    function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

// })();