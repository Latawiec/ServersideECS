import { SDF } from "../../Common/Math/SDF";
import { ReadonlyVec3, vec3, vec2, vec4, mat4 } from "gl-matrix"

var c = document.getElementById("myCanvas") as HTMLCanvasElement
var ctx = c!.getContext("2d")!;

var mousePos = vec2.create();

c.addEventListener("mousemove", function(e) { 
    var cRect = c.getBoundingClientRect();        // Gets CSS pos, and width/height
    mousePos[0] = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas 
    mousePos[1] = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make  
});

function setPixel(imageData: any, x: number, y: number, r: number, g: number, b: number, a: number) {
    var index = 4 * (x + y * imageData.width);
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

//var imgData = ctx.createImageData(c.width, c.height);

async function asdf() {

var itCount = 0;
while ( true )  {
    await new Promise(r => setTimeout(r, 0));
    ctx.clearRect(0, 0, 1000, 1000);
    var imgData = ctx.createImageData(c.width, c.height);

    const boxCenter = vec3.fromValues(450, 450, 0);
    const boxWidth = vec3.fromValues(150*Math.sin(2), 150*Math.cos(5), 0);
    const boxHeight = vec3.fromValues(50*-Math.cos(5), 50*Math.sin(2), 0);
    const boxDepth = vec3.fromValues(0, 0, Number.MAX_SAFE_INTEGER);

    const capsuleBase = vec3.fromValues(400, 400, 0);
    const capsuleExtension = vec3.fromValues(100*-Math.cos(0.1*itCount), 100*Math.sin(0.1*itCount), 0);
    const capsuleBaseRadius = 50;

    const coneBase = vec3.fromValues(500, 500, 0);
    const coneDirection = vec3.fromValues(500*-Math.cos(0.1*itCount), -500*Math.sin(0.1*itCount), 0);


    for (var x = itCount % 2; x<c.width; x+=2) {
        for (var y = itCount % 2; y<c.height; y+=2) {
            const pos = vec4.fromValues(x, y, 0, 1);
            // const dist = SDF.BoxSDF(pos, boxCenter, boxWidth, boxHeight, boxDepth);
            //const dist = SDF.CapsuleSDF(pos, capsuleBase, capsuleExtension, capsuleBaseRadius);
            const dist = SDF.ConeCollision(pos, coneBase, coneDirection, Math.PI / 8) ? 0.0 : 500.0;
            if (dist > 50) {
                if (x % 3 != 0 && y % 3 != 0) continue;
            }
            
            if (dist > 200) {
                if (x % 5 != 0 && y % 5 != 0) continue;
            }
            if (dist > 300) {
                if (x % 7 != 0 && y % 7 != 0) continue;
            }
            if (dist > 400) {
                if (x % 9 != 0 && y % 9 != 0) continue;
            }
            const val = (1.0 - dist/500);///500;

            setPixel(imgData, x, y, 0, 0, 0, 255*val);
            // console.log("Set: ", x, " ", y);
        }
    }

    ctx.putImageData(imgData, 0, 0);

    itCount += 1;

    // Draw box axis
    if (false) {
    ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.moveTo(boxCenter[0] - 50 * boxWidth[0], boxCenter[1] - 50 * boxWidth[1]);
        ctx.lineTo(boxCenter[0] + 50 * boxWidth[0], boxCenter[1] + 50 * boxWidth[1]);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(boxCenter[0] - 50 * boxHeight[0], boxCenter[1] - 50 * boxHeight[1]);
        ctx.lineTo(boxCenter[0] + 50 * boxHeight[0], boxCenter[1] + 50 * boxHeight[1]);
        ctx.stroke();
        ctx.closePath();
    }

    var circlePos = vec4.fromValues(500, 500, 0, 1);
    const transform = SDF.transformToBoxAlignedSpace(boxCenter, boxWidth, boxHeight, boxDepth);

    var afterTransform = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(afterTransform, circlePos, transform);
    var afterTranslate = vec4.copy(vec4.create(), afterTransform);
    afterTranslate[0] += 500 * Math.sin(itCount * 0.01);
    //afterTranslate[1] += 100;
    // console.log(transform);
    // console.log(afterTransform);

    var inverse = mat4.create();
    inverse = mat4.invert(inverse, transform);
    var afterInverse = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(afterInverse, afterTranslate, inverse);

    // console.log(afterInverse);

    ctx.beginPath();
    ctx.arc(circlePos[0], circlePos[1], 50, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#0000FF";
    ctx.arc(afterTransform[0], afterTransform[1], 50, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#00FF00";
    ctx.arc(afterTranslate[0], afterTranslate[1], 50, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    ctx.arc(afterInverse[0], afterInverse[1], 50, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw box
    if (false) {
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";
    const topRight = vec3.add(vec3.create(), boxCenter, vec3.add(vec3.create(), boxWidth, boxHeight));
    const bottomRight = vec3.add(vec3.create(), boxCenter, vec3.add(vec3.create(), boxWidth, vec3.negate(vec3.create(), boxHeight)));
    const bottomLeft = vec3.add(vec3.create(), boxCenter, vec3.add(vec3.create(), vec3.negate(vec3.create(), boxWidth), vec3.negate(vec3.create(), boxHeight)));
    const topLeft = vec3.add(vec3.create(), boxCenter, vec3.add(vec3.create(), vec3.negate(vec3.create(), boxWidth), boxHeight));

    ctx.moveTo(topRight[0], topRight[1]);
    ctx.lineTo(bottomRight[0], bottomRight[1]);
    ctx.lineTo(bottomLeft[0], bottomLeft[1]);
    ctx.lineTo(topLeft[0], topLeft[1]);
    ctx.lineTo(topRight[0], topRight[1]);
    ctx.fill();
    }

    const mouseVec4 = vec4.fromValues(mousePos[0], mousePos[1], 0, 1);
    
    console.log("Distance: ", 
        SDF.BoxSDF(mouseVec4, boxCenter, boxWidth, boxHeight, boxDepth)
    );


    
}

}

asdf();