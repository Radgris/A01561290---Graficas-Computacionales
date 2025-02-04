let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 50000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl, scale, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let x = scale;

    console.log("Cube scale is : " + x)

    let verts = [


        // Front face
        -x, -x, x,
        x, -x, x,
        x, x, x,
        -x, x, x,

        // Back face
        -x, -x, -x,
        -x, x, -x,
        x, x, -x,
        x, -x, -x,

        // Top face
        -x, x, -x,
        -x, x, x,
        x, x, x,
        x, x, -x,

        // Bottom face
        -x, -x, -x,
        x, -x, -x,
        x, -x, x,
        -x, -x, x,

        // Right face
        x, -x, -x,
        x, x, -x,
        x, x, x,
        x, -x, x,

        // Left face
        -x, -x, -x,
        -x, -x, x,
        -x, x, x,
        -x, x, -x
    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0] // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color => {
        for (let j = 0; j < 4; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23 // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let cube = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: cubeIndexBuffer,
        vertSize: 3,
        nVerts: 24,
        colorSize: 4,
        nColors: 24,
        nIndices: 36,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return cube;
};

function createPyramid(gl, scale, translation, rotationAxis) {


    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let x = scale;
    console.log("Pyramid scale is : " + x)

    let verts = [

        //external1

        -2 * scale, 0, -1 * scale,
        -2 * scale, 0, 1 * scale,
        0, 5 * scale, 0,

        //external2

        -2 * scale, 0, 1 * scale,
        0, 0, 2 * scale,
        0, 5 * scale, 0,

        //external3

        0, 0, 2 * scale,
        2 * scale, 0, 0,
        0, 5 * scale, 0,

        //external4

        2 * scale, 0, 0,
        0, 0, -2 * scale,
        0, 5 * scale, 0,

        //external5
        0, 0, -2 * scale,
        -2 * scale, 0, -1 * scale,
        0, 5 * scale, 0,

        //internal1

        -2 * scale, 0, -1 * scale,
        -2 * scale, 0, 1 * scale,
        0, 0, 0,

        //internal2

        -2 * scale, 0, 1 * scale,
        0, 0, 2 * scale,
        0, 0, 0,

        //internal3

        0, 0, 2 * scale,
        2 * scale, 0, 0,
        0, 0, 0,

        //internal4

        2 * scale, 0, 0,
        0, 0, -2 * scale,
        0, 0, 0,

        //internal5   

        0, 0, -2 * scale,
        -2 * scale, 0, -1 * scale,
        0, 0, 0

    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // e1
        [0.0, 1.0, 0.0, 1.0], // e2
        [0.0, 0.0, 1.0, 1.0], // e3
        [1.0, 1.0, 0.0, 1.0], // e4
        [1.0, 0.0, 1.0, 1.0], // e5
        [0.0, 1.0, 1.0, 1.0], // i1
        [0.0, 1.0, 1.0, 1.0], // i2
        [0.0, 1.0, 1.0, 1.0], // i3
        [0.0, 1.0, 1.0, 1.0], // i4
        [0.0, 1.0, 1.0, 1.0] // i5

    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23,
        24, 25, 26,
        27, 28, 29
    ];


    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: pyramidIndexBuffer,
        vertSize: 3,
        nVerts: verts.length / 3,
        colorSize: 4,
        nColors: vertexColors.length / 4,
        nIndices: pyramidIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
};

function createDodecahedron(gl, scale, translation, rotationAxis) {


    //the infor required to define the pentagons was taken from: https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Platonic+Solid+Generator+-+Part+2.html
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let x = scale;
    console.log("dodecahedron scale is : " + x)

    phi = (1 + Math.sqrt(5)) / 2



    let aux_verts = [
        //orange cube

        -1, 1, 1,
        1, 1, 1,
        1, -1, 1,
        -1, -1, 1,

        -1, 1, -1,
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,

        //green rectangle

        0, 1 / phi, phi,
        0, -1 / phi, phi,
        0, 1 / phi, -phi,
        0, -1 / phi, -phi,

        //blue rectangle

        -1 / phi, phi, 0,
        1 / phi, phi, 0,
        -1 / phi, -phi, 0,
        1 / phi, -phi, 0,

        //pink rectangle

        -phi, 0, 1 / phi,
        phi, 0, 1 / phi,
        -phi, 0, -1 / phi,
        phi, 0, -1 / phi

    ]

    let verts = [

        //p1 g1-og1-og2-b1-b2

        0, 1 / phi, phi,
        -1, 1, 1,
        1, 1, 1,
        -1 / phi, phi, 0,
        1 / phi, phi, 0,

        //p2 g3-og5-og6-b1-b2

        0, 1 / phi, -phi,
        -1, 1, -1,
        1, 1, -1,
        -1 / phi, phi, 0,
        1 / phi, phi, 0,

        //p3 g4-og7-og8-b4-b3

        0, -1 / phi, -phi,
        1, -1, -1,
        -1, -1, -1,
        1 / phi, -phi, 0,
        -1 / phi, -phi, 0,

        //p4 g2-og3-og4-b4-b3

        0, -1 / phi, phi,
        1, -1, 1,
        -1, -1, 1,
        1 / phi, -phi, 0,
        -1 / phi, -phi, 0,

        //p5 p1-og1-og4-g1-g2

        -phi, 0, 1 / phi,
        -1, 1, 1,
        -1, -1, 1,
        0, 1 / phi, phi,
        0, -1 / phi, phi,

        //p6 p2-og2-og3-g1-g2

        phi, 0, 1 / phi,
        1, 1, 1,
        1, -1, 1,
        0, 1 / phi, phi,
        0, -1 / phi, phi,

        //p7 p3-og5-og8-g3-g4

        -phi, 0, -1 / phi,
        -1, 1, -1,
        -1, -1, -1,
        0, 1 / phi, -phi,
        0, -1 / phi, -phi,

        //p8 p4-og6-og7-g3-g4

        phi, 0, -1 / phi,
        1, 1, -1,
        1, -1, -1,
        0, 1 / phi, -phi,
        0, -1 / phi, -phi,

        //p9 b1-og1-og5-p1-p3

        -1 / phi, phi, 0,
        -1, 1, 1,
        -1, 1, -1,
        -phi, 0, 1 / phi,
        -phi, 0, -1 / phi,

        //p10 b3-og4-og8-p1-p3

        -1 / phi, -phi, 0,
        -1, -1, 1,
        -1, -1, -1,
        -phi, 0, 1 / phi,
        -phi, 0, -1 / phi,

        //p11 b2-og2-og6-p2-p4

        1 / phi, phi, 0,
        1, 1, 1,
        1, 1, -1,
        phi, 0, 1 / phi,
        phi, 0, -1 / phi,

        //p12 b4-og3-og7-p2-p4

        1 / phi, -phi, 0,
        1, -1, 1,
        1, -1, -1,
        phi, 0, 1 / phi,
        phi, 0, -1 / phi,

    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [

        [0.0, 0.0, 0.0, 1.0], // p1 
        [0.0, 0.0, 1.0, 1.0], // p2 
        [0.0, 1.0, 0.0, 1.0], // p3
        [0.0, 1.0, 1.0, 1.0], // p4
        [1.0, 0.0, 0.0, 1.0], // p5
        [1.0, 0.0, 1.0, 1.0], // p6
        [1.0, 1.0, 0.0, 1.0], // p7
        [1.0, 1.0, 1.0, 1.0], // p8
        [0.0, 0.0, 0.0, 1.0], // p9
        [0.0, 0.0, 1.0, 1.0], // p10
        [0.0, 1.0, 0.0, 1.0], // p11
        [0.0, 1.0, 1.0, 1.0], // p12

    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    let dodecahedronIndices = [

        //p1
        0, 1, 2,
        1, 2, 3,
        2, 3, 4,

        //p2

        5, 6, 7,
        6, 7, 8,
        7, 8, 9,

        //p3

        10, 11, 12,
        11, 12, 13,
        12, 13, 14,

        //p4

        15, 16, 17,
        16, 17, 18,
        17, 18, 19,

        //p5

        20, 21, 22,
        21, 22, 23,
        22, 23, 24,

        //p6

        25, 26, 27,
        26, 27, 28,
        27, 28, 29,

        //p7

        30, 31, 32,
        31, 32, 33,
        32, 33, 34,

        //p8

        35, 36, 37,
        36, 37, 38,
        37, 38, 39,

        //p9
        40, 41, 42,
        41, 42, 43,
        42, 43, 44,

        //p10

        45, 46, 47,
        46, 47, 48,
        47, 48, 49,

        //p11

        50, 51, 52,
        51, 52, 53,
        52, 53, 54,

        //p12

        55, 56, 57,
        56, 57, 58,
        57, 58, 59,
    ];


    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);

    let dodecahedron = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: dodecahedronIndexBuffer,
        vertSize: 3,
        nVerts: verts.length / 3,
        colorSize: 4,
        nColors: vertexColors.length / 4,
        nIndices: dodecahedronIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, [0.0, 1.0, 0, 0]);
    };

    return dodecahedron;
};

function createOctahedron(gl, scale, translation, rotationAxis) {

    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let x = scale;
    console.log("Octahedron scale is : " + x)

    let verts = [

        //up1*scale

        0, 0, -1 * scale,
        1 * scale, 0, 0,
        0, 1 * scale, 0,

        //up2

        1 * scale, 0, 0,
        0, 0, 1 * scale,
        0, 1 * scale, 0,

        //up3

        0, 0, 1 * scale,
        -1 * scale, 0, 0,
        0, 1 * scale, 0,

        //up4

        -1 * scale, 0, 0,
        0, 0, -1 * scale,
        0, 1 * scale, 0,

        //down1*scale

        0, 0, -1 * scale,
        1 * scale, 0, 0,
        0, -1 * scale, 0,

        //down2

        1 * scale, 0, 0,
        0, 0, 1 * scale,
        0, -1 * scale, 0,

        //down3

        0, 0, 1 * scale,
        -1 * scale, 0, 0,
        0, -1 * scale, 0,

        //down4

        -1 * scale, 0, 0,
        0, 0, -1 * scale,
        0, -1 * scale, 0

    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // u1
        [0.0, 1.0, 0.0, 1.0], // u2
        [0.0, 0.0, 1.0, 1.0], // u3
        [1.0, 1.0, 0.0, 1.0], // u4
        [0.0, 0.0, 1.0, 1.0], // d1
        [1.0, 1.0, 0.0, 1.0], // d2
        [1.0, 0.0, 0.0, 1.0], // d3
        [0.0, 1.0, 0.0, 1.0], // d4


    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23
    ];


    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

    let octahedron = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: octahedronIndexBuffer,
        vertSize: 3,
        nVerts: verts.length / 3,
        colorSize: 4,
        nColors: vertexColors.length / 4,
        nIndices: octahedronIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    var y = 0
    let direction = 1;

    octahedron.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

       

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        

        switch (y) {
            case 2:
                console.log("case Positive")
                direction=-1;       
                break;
            
            case -2:
                console.log("case Negative")
                direction=1;
                break;

            default:
                console.log("case default: Y = "+ y)
                break;
        }

        y=y+direction;

        mat4.translate(this.modelViewMatrix,this.modelViewMatrix,[0 , direction, 0]);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

          

    };

    return octahedron;

};

function createShader(gl, str, type) {
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function () {
        run(gl, objs);
    });

    draw(gl, objs);

    for (i = 0; i < objs.length; i++)
        objs[i].update();
}