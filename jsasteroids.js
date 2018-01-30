function SpaceObject() {
    this.size = 1;
    this.x = 100;
	this.y = 100;
	this.dx = 0;;
	this.dy = 0;
	this.angle = 0;
}


function drawWireframe(ctx, coordinates, x, y, r, s, color) {
    var transformedCoordinates = []
    var verts = coordinates.length;
    for (var i = 0; i < verts; i++) {
        var p = {};
        p.x = coordinates[i].x;
        p.y = coordinates[i].y;
        transformedCoordinates.push(p);
    }

    //rotate
    for (var i = 0; i < verts; i++) {
        transformedCoordinates[i].x = coordinates[i].x * Math.cos(r) - coordinates[i].y * Math.sin(r);
        transformedCoordinates[i].y = coordinates[i].x * Math.sin(r) + coordinates[i].y * Math.cos(r);
    }

    //scale
    for (var i = 0; i < verts; i++) {
        transformedCoordinates[i].x = transformedCoordinates[i].x * s;
        transformedCoordinates[i].y = transformedCoordinates[i].y * s;
    }

    //move
    for (var i = 0; i < verts; i++) {
        transformedCoordinates[i].x = transformedCoordinates[i].x + x;
        transformedCoordinates[i].y = transformedCoordinates[i].y + y;
    }


    var n = transformedCoordinates.length;
    for (var i = 0; i < n + 1; i++) {
        drawLine(transformedCoordinates[i % n].x, transformedCoordinates[i % n].y, 
            transformedCoordinates[(i + 1) % n].x, transformedCoordinates[(i + 1) % n].y,
                color);
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function run(timestamp) {
    elapsed = timestamp - start;
    start = timestamp;
    
    player.x += player.dx * elapsed;
    player.y += player.dy * elapsed;
    
    var p = wrap(player.x, player.y);
    player.x = p.x;
    player.y = p.y;

    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i];
        var dead = isPointInACircle(player.x, player.y, a.x, a.y, a.size);
        if (dead) {
            cancelAnimationFrame(pid);
            return;
        }
    }

    bullets = bullets.filter(function(b) {
        return b.x > 1 &&  b.x < canvas.width - 1  && b.y > 1 && b.y < canvas.height - 1;
    });
    asteroids = asteroids.filter(function(a) {
        return a.x != 1000;
    });

    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].dx * elapsed;
        asteroids[i].y += asteroids[i].dy * elapsed;
        var p = wrap(asteroids[i].x, asteroids[i].y);
        asteroids[i].x = p.x
        asteroids[i].y = p.y;
        asteroids[i].angle += 0.0005 * elapsed;
    }
    
    var newAsteroids = [];
    for(var i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].dx * elapsed;
        bullets[i].y += bullets[i].dy * elapsed;
        var p = wrap(bullets[i].x, bullets[i].y);
        bullets[i].x = p.x
        bullets[i].y = p.y;
        for (var j = 0; j < asteroids.length; j++) {
            var a = asteroids[j];
            var hit = isPointInACircle(bullets[i].x, bullets[i].y, a.x, a.y, a.size);
            if (hit) {
                console.log("hit");
                bullets[i].x = 1000;
                if (a.size >= 8) {
                    var angle = Math.random() * Math.PI * 2;
                    var newAsteroid = new SpaceObject();
                    newAsteroid.size = a.size / 2;
                    newAsteroid.x = a.x;
                    newAsteroid.y = a.y;
                    newAsteroid.dx = 0.05 * Math.sin(angle);
                    newAsteroid.dy = 0.05 * Math.cos(angle);
                    newAsteroids.push(newAsteroid);
                    angle = Math.random() * Math.PI * 2;
                    newAsteroid = new SpaceObject();
                    newAsteroid.size = a.size / 2;
                    newAsteroid.x = a.x;
                    newAsteroid.y = a.y;
                    newAsteroid.dx = 0.05 * Math.sin(angle);
                    newAsteroid.dy = 0.05 * Math.cos(angle);
                    newAsteroids.push(newAsteroid);
                }
                a.x = 1000;
            }
        }
    }

    for (var i = 0; i < newAsteroids.length; i++) {
        asteroids.push(newAsteroids[i]);
    }
    
    resetField();
    drawPlayer();
    drawAsteroids();
    drawBullets();
    
    pid = requestAnimationFrame(run);

}

var start = null;
var elapsed;
var canvas;
var ctx;
var player;
var modelShip;
var modelAsteroid;
var asteroids;
var bullets;
var running = true;
var pid;

player = new SpaceObject();
player.size = 5;
player.x = 400;
player.y = 300;
modelShip = [];
modelShip.push({x:0, y:-5});
modelShip.push({x:-2.5, y:2.5});
modelShip.push({x:2.5, y:2.5});

modelAsteroid = [];
var verts = 20;
for (var i = 0; i < verts; i ++) {
    //var radius = 1;
    var radius = Math.random()  * (1.2 - 0.8) + 0.8;
    var a = i / verts * Math.PI * 2;
    var v = {
        x: radius * Math.sin(a),
        y: radius * Math.cos(a)
    };
    modelAsteroid.push(v);
}

asteroids = [];
var asteroid = new SpaceObject();
asteroid.size = 64; //64 - 32 - 16 - 8
asteroid.x = 100;
asteroid.y = 100;
asteroid.dx = 0.05;
asteroid.dy = 0.05;
asteroids.push(asteroid);

bullets = [];

document.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById("field");
    ctx = canvas.getContext('2d');
    requestAnimationFrame(run);
});

document.addEventListener("keydown", function(event) {
    if (event.keyCode == 39) { //right arrow
        player.angle += 0.007  * elapsed;
    }
    if (event.keyCode == 37) { //left arrow
        player.angle -= 0.007 * elapsed;
    }
    if (event.keyCode == 38) { //up arrow
        player.dx += Math.sin(player.angle) * 0.01 * elapsed;
		player.dy += -Math.cos(player.angle) * 0.01 * elapsed;
    }
    if (event.keyCode == 32) { //space
        var b = new SpaceObject();
        b.x = player.x;
        b.y = player.y;
        b.dx = Math.sin(player.angle) * 0.1;
        b.dy = -Math.cos(player.angle) * 0.1;
        bullets.push(b);
    }
});

function wrap(x, y) {
    var ox = x;
    var oy = y;
    if (x < 0) {
        ox = x + canvas.width;
    }
    if (x > canvas.width) {
        ox = x - canvas.width;
    }
    if (y < 0) {
        oy = y + canvas.height;
    }
    if (y > canvas.height) {
        oy = y - canvas.height;
    }
    return {x: ox, y: oy};
}

function resetField() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    drawWireframe(ctx, modelShip, player.x, player.y, player.angle, player.size, "white");
}

function drawAsteroids() {
    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i];
        drawWireframe(ctx, modelAsteroid, a.x, a.y, a.angle, a.size, "yellow");
    }
}

function drawBullets() {
    for (var i = 0; i < bullets.length; i++) {
        var a = bullets[i];
        drawWireframe(ctx, modelAsteroid, a.x, a.y, a.angle, 1, "white");
    }
}

function drawLine(x1, y1, x2, y2, color) {
    var  x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
    dx = x2 - x1;
    dy = y2 - y1;
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;
    if (dy1 <= dx1)	{
		if (dx >= 0) {
            x = x1;
            y = y1;
            xe = x2;
		}
		else {
            x = x2;
            y = y2;
            xe = x1;
        }
		draw(x, y, color);
		for (i = 0; x<xe; i++) {
			x = x + 1;
			if (px<0)
				px = px + 2 * dy1;
			else {
				if ((dx<0 && dy<0) || (dx>0 && dy>0))
					y = y + 1;
				else
		    		y = y - 1;
				px = px + 2 * (dy1 - dx1);
			}
			draw(x, y, color);
			}
		}
	else {
		if (dy >= 0) {
			x = x1;
			y = y1;
			ye = y2;
		}
		else {
			x = x2;
			y = y2;
			ye = y1;
		}
		draw(x, y, color);
		for (i = 0; y<ye; i++) {
			y = y + 1;
			if (py <= 0)
				py = py + 2 * dx1;
			else {
				if ((dx<0 && dy<0) || (dx>0 && dy>0))
					x = x + 1;
				else
					x = x - 1;
                py = py + 2 * (dx1 - dy1);
			}
			draw(x, y, color);
		}
	}
}

function draw(x, y, color) {
    var p = wrap(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(p.x, p.y, 1, 1);
}

function isPointInACircle(px, py, cx, cy, radius) {
    var distance = Math.sqrt((px - cx)*(px - cx)  + (py - cy)*(py - cy));
    return distance < radius;
}