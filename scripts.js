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


class Rectangle {
    pointA;
    pointB = new Coordinate(0,0);
    length;
    radians;

    constructor(x, y, length, width, radians, parent = null) {
        this.pointA = new Coordinate(x,y);
        this.length = length;
        this.radians = radians;
        this.parent = parent;
        this.lineWidth = width;
    }

    setA(coords) {
        this.pointA = coords;
        this.calculateB();
    }

    calculateA() {
        let x = this.pointB.x + Math.cos(this.radians) * this.length;
        let y = this.pointB.y + Math.sin(this.radians) * this.length;
        this.pointA.x = x;
        this.pointA.y = y;
    }

    calculateB() {
        let x = this.pointA.x + Math.sin(this.radians) * this.length;
        let y = this.pointA.y + Math.cos(this.radians) * this.length;
        this.pointB.x = x;
        this.pointB.y = y;
    }

    calculateAngle(ax, ay, bx, by) {
        // Implement max amount of change from parent rect
        let maxPercChange = 0.5;
        let newRadians = Math.atan2((ay - by), (ax - bx));
        this.radians = newRadians;
    }    

    follow() {
        let followX;
        let followY;

        if(this.parent) {
            followX = this.parent.pointA.x;
            followY = this.parent.pointA.y;
        } else {
            followX = mouse.x;
            followY = mouse.y;
        }

        this.calculateAngle(this.pointA.x, this.pointA.y, followX, followY);
        this.pointB.x = followX;
        this.pointB.y = followY;
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
        this.initializeSegments();
    }

    initializeSegments() {
        for(let i = 0; this.segmentCount > i; i++) {
            
            if(i === 0) {
                this.segments.push(new Rectangle(this.base.x, this.base.y, 100, 3, 10));
                continue;
            }
            this.segments.push(
                new Rectangle(
                    this.segments[i-1].pointA.x, 
                    this.segments[i-1].pointA.y, 
                    100, 
                    3, 
                    0, 
                    this.segments[i-1]
                )
            );
            
        }
    }

    update() {
        for(let i=0; this.segments.length > i; i++) {
            this.segments[i].follow();
        }
    }

    setBase(base) {
        this.segments[0].setA(Object.assign({}, base));
    }

    fixSegments() {
        for(let i = 1; this.segments.length > i; i++) {
            this.segments[i].setA(Object.assign({}, this.segments[i-1].pointB));
        }
    }    

    draw() {
        for(let i=0; this.segments.length > i; i++) {
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
    tentacle = new Tentacle(
        new Coordinate(200, 300),
        5
    );

    base = new Coordinate(canvas.width / 2, canvas.height);
    animate();
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);    
    
    tentacle.update();
    tentacle.setBase(base);    
    // tentacle.fixSegments();
    tentacle.draw();     

    requestAnimationFrame(animate);
}
init();