function drawTriag(ctx, a, b, c) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.fill();
}

function midpoint(ctx, a, b, c, dim) {
    if (dim > 0) {

        var nA = {
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            },
            nB = {
                x: (b.x + c.x) / 2,
                y: (b.y + c.y) / 2
            },
            nC = {
                x: (c.x + a.x) / 2,
                y: (c.y + a.y) / 2
            };

        midpoint(ctx, a, nA, nC, dim - 1);
        midpoint(ctx, nA, b, nB, dim - 1);
        midpoint(ctx, nC, nB, c, dim - 1);
    } else {
        drawTriag(ctx, a, b, c)
    }
}


function main() {
    //slider
    let dimention;
    const slider = document.getElementById("triangleRange")
    const display = document.getElementById("rangeDisplay")
    slider.oninput = () => {
        dimention = slider.value
        display.innerHTML = dimention
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        midpoint(ctx, a, b, c, dimention);
    }

    //canvas
    const width = 1200;
    const height = 800;
    const color = 'rgba(0, 0, 200, 1.0)'
    let canvas = document.getElementById("htmlCanvas");
    if (!canvas) {
        console.log("Failed to load the canvas element.")
        return;
    }
    let ctx = canvas.getContext("2d");

    //triangle basic parameters
    var a = {
            x: width / 2,
            y: 0
        },
        b = {
            x: 0,
            y: height
        },
        c = {
            x: width,
            y: height
        };
    //default triangle
    midpoint(ctx, a, b, c, dimention);

}