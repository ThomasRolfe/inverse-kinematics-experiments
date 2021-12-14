const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    length;
    radians;

    constructor(x, y, length, width, radians, parent = null) {
        this.pointA = new Coordinate(x, y);
        this.length = length;
        this.radians = radians;
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
        ctx.fillStyle = "#000000";
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.pointA.x, this.pointA.y);
        ctx.lineTo(this.pointB.x, this.pointB.y);
        ctx.stroke();
    }
}

class Tentacle {
    segments = [];

    constructor(base, segmentCount = 1, fixed = false) {
        this.base = base;
        this.fixed = fixed;
        this.segmentCount = segmentCount;

        this.segments.push(new Segment(0, 0, 100, 3, 0));

        for (let i = 1; this.segmentCount > i; i++) {
            this.segments.push(
                new Segment(0, 0, 100, 3, 0, this.segments[i - 1])
            );
        }
    }

    update() {
        // Last segment follow mouse
        let headSegment = this.segments[this.segments.length - 1];
        headSegment.follow(mouse.x, mouse.y);

        for (let i = this.segments.length - 2; i >= 0; i--) {
            this.segments[i].follow(
                this.segments[i + 1].pointA.x,
                this.segments[i + 1].pointA.y
            );
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

let tentacle;
let base;

function init() {
    tentacle = new Tentacle(new Coordinate(200, 300), 4);
    base = new Coordinate(canvas.width / 2, canvas.height);
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tentacle.update();
    tentacle.segments[0].setA(base);
    tentacle.anchorPoints();
    tentacle.draw();

    requestAnimationFrame(animate);
}
init();
