const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

window.addEventListener("resize", function () {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});

const mouse = {
    x: null,
    y: null,
};

canvas.addEventListener("mousemove", function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Segment {
    pointA = new Coordinate(0, 0);
    pointB = new Coordinate(0, 0);
    drawPointA = new Coordinate(0, 0);
    length;
    radians;

    constructor(
        x,
        y,
        length,
        width,
        radians,
        color = "#e0f2ff",
        parent = null
    ) {
        this.pointA = new Coordinate(x, y);
        this.length = length;
        this.radians = radians;
        this.color = color;
        this.parent = parent;
        this.lineWidth = width;
    }

    setA(coords) {
        this.pointA.x = coords.x;
        this.pointA.y = coords.y;
        this.calculateB();
    }

    calculateA() {
        this.pointA.x = this.pointB.x + Math.cos(this.radians) * this.length;
        this.pointA.y = this.pointB.y + Math.sin(this.radians) * this.length;
    }

    calculateB() {
        this.pointB.x = this.pointA.x - Math.cos(this.radians) * this.length;
        this.pointB.y = this.pointA.y - Math.sin(this.radians) * this.length;
    }

    calculateAngle(ax, ay, targetX, targetY) {
        let newRadians = Math.atan2(ay - targetY, ax - targetX);
        this.radians = newRadians;
    }

    follow(x, y) {
        this.calculateAngle(this.pointA.x, this.pointA.y, x, y);
        this.pointB.x = x;
        this.pointB.y = y;
        this.calculateA();
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.pointA.x, this.pointA.y);
        ctx.lineTo(this.pointB.x, this.pointB.y);
        ctx.stroke();
        // avoid connector on last segment
        this.circleConnector(this.pointB.x, this.pointB.y);
    }

    circleConnector(x, y) {
        // Add logic to draw a circle
    }

    inMouseRange() {
        return true;
        if (
            (Math.abs(this.pointB.x - mouse.x) < 150 ||
                Math.abs(this.pointB.x + mouse.x) < 150) &&
            (Math.abs(this.pointB.y - mouse.y) < 150 ||
                Math.abs(this.pointB.y + mouse.y) < 150)
        ) {
            return true;
        }

        return false;
    }

    applySink() {
        let xFluctuation = 2 * (1 - Math.random() * 2);
        let x = this.pointB.x + 0;
        let y = this.pointB.y + 0;
        this.follow(x, y);
        // decide on an x/y
        // x can be constant
        // y can be small movement either way
    }
}

class Tentacle {
    segments = [];

    constructor(
        base,
        segmentCount = 1,
        segmentLength = 10,
        segmentWidth = 20,
        fixed = false
    ) {
        this.base = base;
        this.fixed = fixed;
        this.segmentCount = segmentCount;
        this.segmentLength = segmentLength;
        this.segmentWidth = segmentWidth;

        this.segments.push(
            new Segment(
                0,
                0,
                this.segmentLength,
                this.segmentWidth,
                0,
                "#e0f2ff"
            )
        );

        for (let i = 1; this.segmentCount > i; i++) {
            // Reduce stroke width evenly from max segment width to 1
            let currentWidth = Math.max(
                10,
                this.segmentWidth - (this.segmentWidth / this.segmentCount) * i
            );

            this.segments.push(
                new Segment(
                    0,
                    0,
                    this.segmentLength,
                    currentWidth,
                    0,
                    "#e0f2ff",
                    this.segments[i - 1]
                )
            );
        }
    }

    update() {
        // If mouse within range, act upon it
        // Else apply some random y movement plus gravity
        let headSegment = this.segments[this.segments.length - 1];
        if (headSegment.inMouseRange()) {
            headSegment.follow(mouse.x, mouse.y);
        } else {
            headSegment.applySink();
        }

        for (let i = this.segments.length - 2; i >= 0; i--) {
            this.segments[i].follow(
                this.segments[i + 1].pointA.x,
                this.segments[i + 1].pointA.y
            );
        }

        if (this.fixed) {
            this.segments[0].setA(this.base);
            this.anchorPoints();
        }
    }

    anchorPoints() {
        for (let i = 1; this.segments.length > i; i++) {
            this.segments[i].setA(this.segments[i - 1].pointB);
        }
    }

    draw() {
        for (let i = 0; this.segments.length > i; i++) {
            this.segments[i].draw();
        }
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let tentacles = [];
let base;
let minimumBoneAngle = 5;
let maximumBoneAngle = 1;
let item;

function init() {
    let segmentCount = 4;
    let segmentLength = 120;
    let tentacleCount = 1;

    for (let i = 0; i < tentacleCount; i++) {
        console.log((canvas.width / (tentacleCount + 1)) * i + 1);
        tentacles.push(
            new Tentacle(
                new Coordinate(
                    (canvas.width / (tentacleCount + 1)) * (i + 1),
                    canvas.height + 10
                ),
                segmentCount,
                segmentLength,
                20,
                true
            )
        );
    }

    animate();
}

function applyMouseGravity() {
    mouse.y += 0.4;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; tentacles.length > i; i++) {
        tentacles[i].update();
        tentacles[i].draw();
    }

    // applyMouseGravity();

    requestAnimationFrame(animate);
}
init();
