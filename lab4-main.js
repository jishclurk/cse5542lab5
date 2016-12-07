
/* Global variables */
var gl;                 /* The WebGL Context */
var shaderProgram;      /* The shader program, set in shader-setup.js */

/* The stack to push our model-view matrices on */
var mvMatrixStack = [];

/* The Model-View Matrices for each part of the person object */
var mvBodyMatrix, mvRightArmMatrix, mvRightForearmMatrix,
    mvLeftArmMatrix, mvLeftForearmMatrix, mvRightLegMatrix,
    mvRightFootMatrix, mvLeftLegMatrix, mvLeftFootMatrix;


/* The VBOs */
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
var cubeVertexNormalBuffer;

var cylinderVertexPositionBuffer;
var cylinderVertexColorBuffer;
var cylinderVertexIndexBuffer;
var cylinderVertexNormalBuffer;

var sphereVertexPositionBuffer;
var sphereVertexColorBuffer;
var sphereVertexUVBuffer;
var sphereVertexIndexBuffer;
var sphereVertexNormalBuffer;

var matAmbientBuffer;
var matDiffuseBuffer;
var matSpecularBuffer;
var matShininessBuffer;

/* Texture object for leaves on tree */
var leafTexture;
var textureLoaded = false;

var mMatrix = mat4.create();            // model matrix
var vMatrix = mat4.create();            // view matrix
var pMatrix = mat4.create();            // projection matrix 
var nMatrix = mat4.create();            // normal matrix
var v2wMatrix = mat4.create();          // eye to world matrix
var Z_angle = 0.0;                      // Angle to rotate due to mouse movement
var globalScaling = [0.75, 0.75, 0.75]; // Angle to scale due to mouse movement


// set up the parameters for lighting 
var light_ambient = [0.5, 0.5, 0.5, 1];     // Ambient light intensity
var light_diffuse = [0.5, 0.5, 0.5, 1];     // Diffuse light intensity
var light_specular = [0.5, 0.5, 0.5, 1];    // Specular light intensity
var light_pos = [0, 0, 5, 1];               // Light position in world space
var lightPositionIncrement = 0.5;           

var lightCoefEnum = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low"
}

/* Camera and COI variables edited by functions called from HTML buttons */
var cameraPosition = [0, 0, 5];
var cameraPositionIncrement = 0.5;

var centerOfInterest = [0, 0, 0];
var COIPositionIncrement = 0.5;

var panAngle = 0;
var panAngleIncrement = 5;

/* Mouse variables for event handlers */
var lastMouseX_left = 0, lastMouseY_left = 0;
var lastMouseX_right = 0, lastMouseY_right = 0;

/* A color enum used to pass the desired color for a shape to be drawn as */
var colorEnum = {
    GREEN: "Green",
    BROWN: "Brown",
    BLUE: "Blue",
    YELLOW: "Yellow",
    RED: "Red",
    TAN: "Tan",
    BLACK: "Black",
    WHITE: "White"
}

/* Enum representing each part of the person. 
   currentPart will be set to one of these values */
var personEnum = {
    BODY: "Body",
    RIGHTARM: "Right Arm",
    RIGHTFOREARM: "Right Forearm",
    LEFTARM: "Left Arm",
    LEFTFOREARM: "Left Forearm",
    RIGHTLEG: "Right Leg",
    RIGHTFOOT: "Right Foot",
    LEFTLEG: "Left Leg",
    LEFTFOOT: "Left Foot"
}

/* The currently selected part the body to perform transformations on */
var currentPart = personEnum.BODY;

/*
    initGL function
        Handles the initialization of the global WebGL Context variable.
*/
function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        console.log(e);
    }

    if (!gl) {
        alert("WebGL Context was not initialized!");
    }
}

function initBuffers() {

    matAmbientBuffer = gl.createBuffer();
    matDiffuseBuffer = gl.createBuffer();
    matSpecularBuffer = gl.createBuffer();
    matShininessBuffer = gl.createBuffer();

    /*** CUBE BUFFER INITIALIZATION ***/

    // Need to use 24 vertices for correct normals
    var cubeVertices = [
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,

        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,

        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,

        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,

        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5

    ];
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    var cubeNormals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];
    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 24;

    var indices = [
        0, 1, 3,
        0, 2, 3,

        4, 5, 7,
        4, 6, 7,

        8, 9, 11,
        8, 10, 11,

        12, 13, 15,
        12, 14, 15,
        
        16, 17, 19,
        16, 18, 19,

        20, 21, 23,
        20, 22, 23
    ];
    cubeVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;  

    
    cubeVertexColorBuffer = gl.createBuffer();
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;
    setColorArray(cubeVertexColorBuffer, colorEnum.BLACK);



    /*** CYLINDER BUFFER INITIALIZATION ***/

    var cylinderVertices = [];
    var cylinderIndices = [];
    var cylinderNormals = []
    var numSlices = 20;     // Can be changed to alter smoothness of circles
    var numStacks = 20;
    var topRadius = 0.5;
    var bottomRadius = 0.5;
    var height = 1;
    var radians = (2 * Math.PI) / (numSlices - 1);
    var x = 0.0;
    var y = 0.0;
    var z = 0.0;

    // Push the top center vertex onto the array
    cylinderVertices.push(x); cylinderVertices.push(y); cylinderVertices.push(height / 2);
    cylinderNormals.push(0.0); cylinderNormals.push(0.0); cylinderNormals.push(1.0);

    //Push the bottom center vertex onto the array
    cylinderVertices.push(x); cylinderVertices.push(y); cylinderVertices.push(-height / 2);
    cylinderNormals.push(0.0); cylinderNormals.push(0.0); cylinderNormals.push(-1.0);

    
    z = height / 2;
    // Calculate and push the vertices around the circles edge for each stack
    for (i = 0; i < numSlices; i++) {
        x = topRadius * Math.cos(radians * i);
        y = topRadius * Math.sin(radians * i);
        cylinderVertices.push(x); cylinderVertices.push(y); cylinderVertices.push(z);
        cylinderNormals.push(0.0); cylinderNormals.push(0.0); cylinderNormals.push(1.0);
    }

    // Calculate and push the vertices and normals for the middle vertices
    for (j = 0; j < numStacks; j++)
    {
        for (i = 0; i < numSlices; i++)
        {
            stack_radius = topRadius + (j / numStacks) * (bottomRadius - topRadius);
            cylinderVertices.push(stack_radius * Math.cos(radians * i));
            cylinderVertices.push(stack_radius * Math.sin(radians * i));
            cylinderVertices.push((height / 2) + (j / numStacks) * ((-height / 2) - (height / 2)));
            cylinderNormals.push(stack_radius * Math.cos(radians * i));
            cylinderNormals.push(stack_radius * Math.sin(radians * i));
            cylinderNormals.push(0.0);
        }
    }

    
    z = -height / 2;
    // Calculate and push the vertices around the circles edge for each stack
    for (i = 0; i < numSlices; i++) {
        x = bottomRadius * Math.cos(radians * i);
        y = bottomRadius * Math.sin(radians * i);
        cylinderVertices.push(x); cylinderVertices.push(y); cylinderVertices.push(z);
        cylinderNormals.push(0.0); cylinderNormals.push(0.0); cylinderNormals.push(-1.0);
    }

    
    // Top Circle Indices
    for (i = 0; i < numSlices - 1; i++) {
        cylinderIndices.push(0); cylinderIndices.push(i + 2); cylinderIndices.push(i + 3);
    }
    cylinderIndices.push(0); cylinderIndices.push(2); cylinderIndices.push(numSlices + 1);
    

    // Middle circle indices
    for (j = 0; j < numStacks; j++)
    {
        for (i = 0; i <= numSlices; i++)
        {
            cylinderIndices.push(numSlices + 2 + (j + 1) * numSlices + (i % numSlices));
            cylinderIndices.push(numSlices + 2 + j * numSlices + (i % numSlices));
            cylinderIndices.push(numSlices + 2 + j * numSlices + ((i + 1) % numSlices));
            cylinderIndices.push(numSlices + 2 + (j + 1) * numSlices + (i % numSlices));
            cylinderIndices.push(numSlices + 2 + j * numSlices + ((i + 1) % numSlices));
            cylinderIndices.push(numSlices + 2 + (j + 1) * numSlices + ((i + 1) % numSlices));
        }
    }

    
    // Bottom Circle Indices
    for (i = 0; i < numSlices - 1; i++) {
        cylinderIndices.push(1); cylinderIndices.push(numSlices + (numStacks * numSlices) + i + 2); cylinderIndices.push(numSlices + (numStacks * numSlices) + i + 3);
    }
    cylinderIndices.push(1); cylinderIndices.push(numSlices + (numStacks * numSlices) + 2); cylinderIndices.push(2 * numSlices + (numStacks * numSlices) + 1);
    

    // Initialize and set the circle's vertex VBO to the calculated array
    cylinderVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderVertices), gl.STATIC_DRAW);
    cylinderVertexPositionBuffer.itemSize = 3;
    cylinderVertexPositionBuffer.numItems = 2 + numSlices * 2 + (numStacks * numSlices);

    cylinderVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderNormals), gl.STATIC_DRAW);
    cylinderVertexNormalBuffer.itemSize = 3;
    cylinderVertexNormalBuffer.numItems = 2 + numSlices * 2 + (numStacks * numSlices);

    cylinderVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderIndices), gl.STATIC_DRAW);
    cylinderVertexIndexBuffer.itemSize = 1;
    cylinderVertexIndexBuffer.numItems = 6 * numSlices + 6 * (numStacks * (numSlices + 1));

    // Initialize and set the circle's color VBO with an inital color of Black
    cylinderVertexColorBuffer = gl.createBuffer();
    cylinderVertexColorBuffer.itemSize = 4;
    cylinderVertexColorBuffer.numItems = 2 + numSlices * 2 + (numStacks * numSlices);

    setColorArray(cylinderVertexColorBuffer, colorEnum.BLACK);


    /*** SPHERE BUFFER INITIALIZATION ***/

    var sphereVertices = [];
    var sphereIndices = [];
    var sphereUV = [];
    var sphereNormals = [];
    var radius = 0.5;
    var numSlices = 20;
    var numStacks = 20;
    var radians = (2 * Math.PI) / numSlices;
    var x = 0.0;
    var y = 0.0;
    var z = 0.0;
    var u = 0.0;
    var v = 0.0;

    // Push Top and Bottom vertices
    sphereVertices.push(x); sphereVertices.push(y); sphereVertices.push(radius);
    sphereVertices.push(x); sphereVertices.push(y); sphereVertices.push(-radius);
    sphereNormals.push(x); sphereNormals.push(y); sphereNormals.push(1.0);
    sphereNormals.push(x); sphereNormals.push(y); sphereNormals.push(-1.0);
    sphereUV.push(0.5 + (Math.atan2(0, 0) / (2 * Math.PI)));
    sphereUV.push(0.5 - (Math.asin(-1) / Math.PI));
    sphereUV.push(0.5 + (Math.atan2(0, 0) / (2 * Math.PI)));
    sphereUV.push(0.5 - (Math.asin(1) / Math.PI));

    // Push there vertices for intermediate circles throughout the spheres
    for (j = 1; j < numStacks; j++)
    {
        z = radius - 2 * (radius * (j / (numStacks)));
        
        for (i = 0; i < numSlices; i++)
        {
            x = Math.sqrt((radius * radius) - (z * z)) * Math.cos(radians * i);
            y = Math.sqrt((radius * radius) - (z * z)) * Math.sin(radians * i);

            sphereVertices.push(x); sphereVertices.push(y); sphereVertices.push(z);
            sphereNormals.push(x); sphereNormals.push(y); sphereNormals.push(z);

            u = 0.5 + (Math.atan2(-2 * x, -2 * y) / (2 * Math.PI));
            v = 0.5 - (Math.asin(-2 * z) / Math.PI);

            if (u > 0.5) u = 1 - u;

            sphereUV.push(u); sphereUV.push(v);
        }
    }

    // Top Circle Indices
    for (i = 0; i < numSlices - 1; i++) {
        sphereIndices.push(0); sphereIndices.push(i + 2); sphereIndices.push(i + 3);
    }
    sphereIndices.push(0); sphereIndices.push(2); sphereIndices.push(numSlices + 1);

    // Indices for triangles that make up the squares for the body of the sphere
    for (j = 0; j < numStacks - 2; j++) {

        for (i = 0; i < numSlices - 1; i++) {
            sphereIndices.push((j * numSlices) + i + 2); sphereIndices.push((j * numSlices) + i + 3); sphereIndices.push(((j + 1) * numSlices) + i + 3);
            sphereIndices.push((j * numSlices) + i + 2); sphereIndices.push(((j + 1) * numSlices) + i + 2); sphereIndices.push(((j + 1) * numSlices) + i + 3);
        }
        sphereIndices.push((j * numSlices) + numSlices + 1); sphereIndices.push((j * numSlices) + 2); sphereIndices.push(((j + 1) * numSlices) + 2);
        sphereIndices.push((j * numSlices) + numSlices + 1); sphereIndices.push(((j + 1) * numSlices) + numSlices + 1); sphereIndices.push(((j + 1) * numSlices) + 2);
    }

    // Bottom Circle Indices
    for (i = 0; i < numSlices - 1; i++) {
        sphereIndices.push(1); sphereIndices.push(((numStacks - 2) * numSlices) + i + 2); sphereIndices.push(((numStacks - 2) * numSlices) + i + 3);
    }
    sphereIndices.push(1); sphereIndices.push(((numStacks - 2) * numSlices) + 2); sphereIndices.push(((numStacks - 1) * numSlices) + 1);


    // Create the sphere buffers
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = 2 + (numSlices * (numStacks - 1));

    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = 2 + (numSlices * (numStacks - 1));

    sphereVertexUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereUV), gl.STATIC_DRAW);
    sphereVertexUVBuffer.itemSize = 2;
    sphereVertexUVBuffer.numItems = 2 + (numSlices * (numStacks - 1));

    sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = (6 * numSlices * (numStacks - 2)) + (6 * numSlices);

    sphereVertexColorBuffer = gl.createBuffer();
    sphereVertexColorBuffer.itemSize = 4;
    sphereVertexColorBuffer.numItems = 2 + (numSlices * (numStacks - 1));

    setColorArray(sphereVertexColorBuffer, colorEnum.BLACK);
}


var cubemapTexture;
var cubemapLoaded = false;

function initCubeMap() {
    var loaded = [];
    for (var i = 0; i < 6; i++) {
        loaded.push(false);
    }

    cubemapTexture = gl.createTexture();
    cubemapTexture.top = new Image();
    cubemapTexture.top.onload = function () {
        loaded[0] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.top.src = "top.png";

    cubemapTexture.bottom = new Image();
    cubemapTexture.bottom.onload = function () {
        loaded[1] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.bottom.src = "bottom.png";

    cubemapTexture.left = new Image();
    cubemapTexture.left.onload = function () {
        loaded[2] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.left.src = "left.png";

    cubemapTexture.right = new Image();
    cubemapTexture.right.onload = function () {
        loaded[3] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.right.src = "right.png";

    cubemapTexture.front = new Image();
    cubemapTexture.front.onload = function () {
        loaded[4] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.front.src = "front.png";

    cubemapTexture.back = new Image();
    cubemapTexture.back.onload = function () {
        loaded[5] = true;
        for (var i = 0; i < 6; i++) {
            if (!loaded[i]) return;
        }
        handleCubemapTextureLoaded(cubemapTexture);
    }
    cubemapTexture.back.src = "back.png";

}

function handleCubemapTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.right);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.left);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.top);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.bottom);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.back);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.front);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    cubemapLoaded = true;
    drawScene();
}


function initTextures() {
    leafTexture = gl.createTexture();
    leafTexture.image = new Image();
    leafTexture.image.onload = function () { handleTextureLoaded(leafTexture); }
    leafTexture.image.src = "leaf.png";
}

function handleTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.bindTexture(gl.TEXTURE_2D, null);
    textureLoaded = true;
    drawScene();
}



function initJSON() {
    var request = new XMLHttpRequest();
    request.open("GET", "teapot.json");
    request.onreadystatechange =
      function () {
          if (request.readyState == 4) {
              handleLoadedTeapot(JSON.parse(request.responseText));
          }
      }
    request.send();
}


var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexTextureCoordBuffer;
var teapotVertexIndexBuffer;
var teapotVertexColorBuffer;
var teapotLoaded = false;

function find_range(positions) {
    xmin = xmax = positions[0];
    ymin = ymax = positions[1];
    zmin = zmax = positions[2];
    for (i = 0; i < positions.length / 3; i++) {
        if (positions[i * 3] < xmin) xmin = positions[i * 3];
        if (positions[i * 3] > xmax) xmax = positions[i * 3];

        if (positions[i * 3 + 1] < ymin) ymin = positions[i * 3 + 1];
        if (positions[i * 3 + 1] > ymax) ymax = positions[i * 3 + 1];

        if (positions[i * 3 + 2] < zmin) zmin = positions[i * 3 + 2];
        if (positions[i * 3 + 2] > zmax) zmax = positions[i * 3 + 2];
    }

    var minRange = xmax - xmin;
    if (ymax - ymin < minRange) minRange = ymax - ymin;
    if (zmax - zmin < minRange) minRange = zmax - zmin;

    return minRange;
}

function handleLoadedTeapot(teapotData) {
    
    var range = find_range(teapotData.vertexPositions);

    for (i = 0; i < teapotData.vertexPositions.length; i++) {
        teapotData.vertexPositions[i] = teapotData.vertexPositions[i] / range;
    }

    teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize = 3;
    teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;

    teapotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize = 3;
    teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;

    teapotVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexTextureCoords),
		  gl.STATIC_DRAW);
    teapotVertexTextureCoordBuffer.itemSize = 2;
    teapotVertexTextureCoordBuffer.numItems = teapotData.vertexTextureCoords.length / 2;

    teapotVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotData.indices), gl.STATIC_DRAW);
    teapotVertexIndexBuffer.itemSize = 1;
    teapotVertexIndexBuffer.numItems = teapotData.indices.length;

    teapotVertexColorBuffer = gl.createBuffer();
    teapotVertexColorBuffer.itemSize = 4;
    teapotVertexColorBuffer.numItems = (teapotData.vertexPositions.length * 4) / 3;
    setColorArray(teapotVertexColorBuffer, colorEnum.WHITE);

    

    teapotLoaded = true;
    drawScene();
}


/* 
    setMatrixUniforms function
        Sets the uniform matrix in the shader to be equal to the value of the matrix parameter
*/
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
    gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);
}

/*
    degToRad function
        Utility function to convert degrees to radians
*/
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/*
    HTML button functions
        The following functions are used 
*/

function moveCameraUp() {
    cameraPosition[1] += cameraPositionIncrement;
    drawScene();
}

function moveCameraDown() {
    cameraPosition[1] -= cameraPositionIncrement;
    drawScene();
}

function moveCameraLeft() {
    cameraPosition[0] -= cameraPositionIncrement;
    drawScene();
}

function moveCameraRight() {
    cameraPosition[0] += cameraPositionIncrement;
    drawScene();
}

function moveCOIUp() {
    centerOfInterest[1] += COIPositionIncrement;
    drawScene();
}

function moveCOIDown() {
    centerOfInterest[1] -= COIPositionIncrement;
    drawScene();
}

function moveCOILeft() {
    centerOfInterest[0] -= COIPositionIncrement;
    drawScene();
}

function moveCOIRight() {
    centerOfInterest[0] += COIPositionIncrement;
    drawScene();
}

function panLeft() {
    panAngle += panAngleIncrement;
    drawScene();
}

function panRight() {
    panAngle -= panAngleIncrement;
    drawScene();
}

/* Function to control light parameters */

function lightLeft() {
    light_pos[0] -= lightPositionIncrement;
    drawScene();
}

function lightRight() {
    light_pos[0] += lightPositionIncrement;
    drawScene();
}

function lightUp() {
    light_pos[1] += lightPositionIncrement;
    drawScene();
}

function lightDown() {
    light_pos[1] -= lightPositionIncrement;
    drawScene();
}

function lightForward() {
    light_pos[2] -= lightPositionIncrement;
    drawScene();
}

function lightBackward() {
    light_pos[2] += lightPositionIncrement;
    drawScene();
}

function lightIntensityUp() {
    if (light_ambient[0] < 1) light_ambient[0] += 0.025;
    if (light_ambient[1] < 1) light_ambient[1] += 0.025;
    if (light_ambient[2] < 1) light_ambient[2] += 0.025;

    if (light_diffuse[0] < 1) light_diffuse[0] += 0.025;
    if (light_diffuse[1] < 1) light_diffuse[1] += 0.025;
    if (light_diffuse[2] < 1) light_diffuse[2] += 0.025;

    if (light_specular[0] < 1) light_specular[0] += 0.025;
    if (light_specular[1] < 1) light_specular[1] += 0.025;
    if (light_specular[2] < 1) light_specular[2] += 0.025;

    drawScene();
}

function lightIntensityDown() {
    if (light_ambient[0] > 0) light_ambient[0] -= 0.025;
    if (light_ambient[1] > 0) light_ambient[1] -= 0.025;
    if (light_ambient[2] > 0) light_ambient[2] -= 0.025;

    if (light_diffuse[0] > 0) light_diffuse[0] -= 0.025;
    if (light_diffuse[1] > 0) light_diffuse[1] -= 0.025;
    if (light_diffuse[2] > 0) light_diffuse[2] -= 0.025;

    if (light_specular[0] > 0) light_specular[0] -= 0.025;
    if (light_specular[1] > 0) light_specular[1] -= 0.025;
    if (light_specular[2] > 0) light_specular[2] -= 0.025;

    drawScene();
}

/*
    setColorArray function
        Allows our drawing functions to set the color of either the circle or square
        color VBO to represent the color from colorEnum
*/
function setColorArray(shapeBuffer, color) {
    var vertexColor = [], result = [];

    // Define the colors used for each colorEnum value
    switch (color) {
        case colorEnum.BLACK:
            vertexColor = [0.0, 0.0, 0.0, 1.0];
            break;
        case colorEnum.BLUE:
            vertexColor = [0.2, 0.2, 1.0, 1.0];
            break;
        case colorEnum.BROWN:
            vertexColor = [0.2, 0.2, 0.0, 1.0];
            break;
        case colorEnum.GREEN:
            vertexColor = [0.6, 0.6, 0.0, 1.0];
            break;
        case colorEnum.RED:
            vertexColor = [1.0, 0.2, 0.2, 1.0];
            break;
        case colorEnum.TAN:
            vertexColor = [1.0, 0.9, 0.6, 1.0];
            break;
        case colorEnum.YELLOW:
            vertexColor = [1.0, 1.0, 0.2, 1.0];
            break;
        case colorEnum.WHITE:
            vertexColor = [1.0, 1.0, 1.0, 1.0];
            break;
        default:
            vertexColor = [1.0, 1.0, 1.0, 1.0];
    }

    try {
        for (i = 0; i < shapeBuffer.numItems; i++) {
            result = result.concat(vertexColor);
        }

        // Set the color VBO
        gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result), gl.STATIC_DRAW);
    }
    catch (err) {
        console.error("Error when setting colors: " + err);
    }
}


/*
    setLightCoefArrays function
        Used to change set the light coefficient properties of each object in the scene.
        To reduce the number of cases, use three different levels of light.
*/
function setLightCoefArrays(shapePosBuffer, intensity) {
    var amb = [], dif = [], spec = [], shiny = 0;
    var res_amb = [], res_dif = [], res_spec = [], res_shiny = [];

    // Choose light coefficients based on intensity for the object
    switch (intensity) {
        case lightCoefEnum.LOW:
            amb = [0.2, 0.2, 0.2, 1.0];
            dif = [0.4, 0.4, 0.4, 1.0];
            spec = [0.5, 0.5, 0.5, 1.0];
            shiny = 30.0;
            break;
        case lightCoefEnum.MEDIUM:
            amb = [0.4, 0.4, 0.4, 1.0];
            dif = [0.6, 0.6, 0.6, 1.0];
            spec = [0.8, 0.8, 0.8, 1.0];
            shiny = 40.0;
            break;
        case lightCoefEnum.HIGH:
            amb = [0.6, 0.6, 0.6, 1.0];
            dif = [0.8, 0.8, 0.8, 1.0];
            spec = [1.0, 1.0, 1.0, 1.0];
            shiny = 50.0;
            break;
        default:
            amb = [0.4, 0.4, 0.4, 1.0];
            dif = [0.6, 0.6, 0.6, 1.0];
            spec = [0.8, 0.8, 0.8, 1.0];
            shiny = 40.0;
            break;
    }

    try {
        // Use push for efficiency
        for (i = 0; i < shapePosBuffer.numItems; i++) {
            res_amb.push(amb[0]);
            res_amb.push(amb[1]);
            res_amb.push(amb[2]);
            res_amb.push(amb[3]);
            res_dif.push(dif[0]);
            res_dif.push(dif[1]);
            res_dif.push(dif[2]);
            res_dif.push(dif[3]);
            res_spec.push(spec[0]);
            res_spec.push(spec[1]);
            res_spec.push(spec[2]);
            res_spec.push(spec[3]);
            res_shiny.push(shiny);
        }

        // Set the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res_amb), gl.STATIC_DRAW);
        matAmbientBuffer.itemSize = 4;
        matAmbientBuffer.numItems = shapePosBuffer.numItems;

        gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res_dif), gl.STATIC_DRAW);
        matDiffuseBuffer.itemSize = 4;
        matDiffuseBuffer.numItems = shapePosBuffer.numItems;

        gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res_spec), gl.STATIC_DRAW);
        matSpecularBuffer.itemSize = 4;
        matSpecularBuffer.numItems = shapePosBuffer.numItems;

        gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res_shiny), gl.STATIC_DRAW);
        matShininessBuffer.itemSize = 1;
        matShininessBuffer.numItems = shapePosBuffer.numItems;
    }
    catch (err) {
        console.error("Error when setting light coefficients: " + err);
    }
}


/*
    draw_cube function
        Creates and draws a cube object that is transformed using the matrix parameter, 
        and set to an inputted color
*/
function draw_cube(color, intensity) {

    setColorArray(cubeVertexColorBuffer, color);
    setLightCoefArrays(cubeVertexPositionBuffer, intensity);

    // Need to calculate normal matrix for each shape drawn
    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    setMatrixUniforms();
    gl.uniform1i(shaderProgram.useTextureUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientCoefAttribute, matAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseCoefAttribute, matDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexSpecularCoefAttribute, matSpecularBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexShininessAttribute, matShininessBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

/*
    draw_sphere function
        Creates and draws a sphere object that is transformed using the matrix parameter, 
        and set to an inputted color
*/
function draw_sphere(color, intensity) {

    setColorArray(sphereVertexColorBuffer, color);
    setLightCoefArrays(sphereVertexPositionBuffer, intensity);

    // Need to calculate normal matrix for each shape drawn
    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    setMatrixUniforms();
    gl.uniform1i(shaderProgram.useTextureUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientCoefAttribute, matAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseCoefAttribute, matDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexSpecularCoefAttribute, matSpecularBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexShininessAttribute, matShininessBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function draw_leaf_sphere() {
    setColorArray(sphereVertexColorBuffer, colorEnum.WHITE);
    setLightCoefArrays(sphereVertexPositionBuffer, lightCoefEnum.MEDIUM);

    // Need to calculate normal matrix for each shape drawn
    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    setMatrixUniforms();
    gl.uniform1i(shaderProgram.useTextureUniform, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientCoefAttribute, matAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseCoefAttribute, matDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexSpecularCoefAttribute, matSpecularBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexShininessAttribute, matShininessBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexUVBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexUVAttribute, sphereVertexUVBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function draw_teapot() {
    // Need to calculate normal matrix for each shape drawn

    setLightCoefArrays(teapotVertexPositionBuffer, lightCoefEnum.MEDIUM);
    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    setMatrixUniforms();
    gl.uniform1i(shaderProgram.useTextureUniform, 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientCoefAttribute, matAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseCoefAttribute, matDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexSpecularCoefAttribute, matSpecularBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexShininessAttribute, matShininessBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexUVAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, teapotVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

/*
    draw_cylinder function
        Creates and draws a cylinder object that is transformed using the matrix parameter, 
        and set to an inputted color
*/
function draw_cylinder(color, intensity) {

    setColorArray(cylinderVertexColorBuffer, color);
    setLightCoefArrays(cylinderVertexPositionBuffer, intensity);

    // Need to calculate normal matrix for each shape drawn
    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    setMatrixUniforms();
    gl.uniform1i(shaderProgram.useTextureUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, matAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientCoefAttribute, matAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseCoefAttribute, matDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matSpecularBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexSpecularCoefAttribute, matSpecularBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, matShininessBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexShininessAttribute, matShininessBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cylinderVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cylinderVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

/*
    drawScene function
        The function that handles drawing the calls to draw our environment and
        our movable object.
*/
function drawScene() {
    if (!textureLoaded || !teapotLoaded || !cubemapLoaded)
        return;

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the projection matrix
    pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix); 

    // Set up the View Matrix, rotate it by the Head Tilt
    mat4.identity(vMatrix);
    var temp;
    vMatrix = mat4.rotate(vMatrix, degToRad(panAngle), [0, 0, 1]);
    temp = mat4.lookAt(cameraPosition, centerOfInterest, [0, 1, 0], temp);	
    vMatrix = mat4.multiply(vMatrix, temp);

    // Set up the Model Matrix, scale and rotate it by the mouse movement variables
    mat4.identity(mMatrix);	
    mMatrix = mat4.scale(mMatrix, globalScaling);
    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle), [0, 1, 0]);

    mat4.identity(v2wMatrix);
    v2wMatrix = mat4.multiply(v2wMatrix, vMatrix); 
    v2wMatrix = mat4.transpose(v2wMatrix);

    gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
    gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
    gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
    gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, leafTexture);
    gl.uniform1i(shaderProgram.textureUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
    gl.uniform1i(shaderProgram.cubeMapTextureUniform, 1);

    // Draw our scene
    drawEnvironment();
    drawPerson();

    //draw_leaf_sphere();
}


/*
    pushMatrix function
        Pushes a model-view matrix onto our stack, in order to save it when performing hierarchical transformations.
*/
function pushMatrix(matrix) {
    var copy = mat4.create();
    mat4.set(matrix, copy);
    mvMatrixStack.push(copy);
}

/*
    popMatrix function
        Pops a model-view matrix off of our stack and returns it
*/
function popMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    var copy = mvMatrixStack.pop();
    return copy;
}


/*
    drawEnvironment function
        Handles the drawing of the static shapes that are added in the 
        background to make the environment more interesting.
*/
function drawEnvironment() {

    pushMatrix(mMatrix);
    mMatrix = mat4.scale(mMatrix, [4.0, 4.0, 4.0]);

    // Draw the tree trunk
    pushMatrix(mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.25, 1.5, 0.25]);
    mMatrix = mat4.translate(mMatrix, [-3.0, -0.1, 0.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
    draw_cylinder(colorEnum.BROWN, lightCoefEnum.LOW);

    // Draw the ground
    mMatrix = popMatrix();
    pushMatrix(mMatrix);
    mMatrix = mat4.scale(mMatrix, [2.0, 0.25, 1.0]);
    mMatrix = mat4.translate(mMatrix, [0.0, -3.5, 0.0]);
    draw_cube(colorEnum.GREEN, lightCoefEnum.LOW);

    // Draw the tree leaves as 3 green circles
    mMatrix = popMatrix();
    pushMatrix(mMatrix);
    mMatrix = mat4.translate(mMatrix, [-1.0, 0.7, 0.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(270), [0, 0, 1]);   // Left most sphere
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [0, 1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.75, 1.0, 1.0]);
    draw_leaf_sphere();

    mMatrix = popMatrix();
    pushMatrix(mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.6, 1.0, 0.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [0, 0, 1]);   // Top most sphere
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [0, 1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.75, 1.0, 1.0]);
    draw_leaf_sphere();

    mMatrix = popMatrix();
    pushMatrix(mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0.6, 0.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [0, 0, 1]);   // Right most sphere
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [0, 1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.65, 0.9, 1.0]);
    draw_leaf_sphere();


    popMatrix();
    mMatrix = popMatrix();
}


/*
    drawPerson function
        Handles drawing the movable person object in the scene, based on the model
        view matrices set by the key and mouse listeners that determine the transformations
        of each body part.
*/
function drawPerson() {

    // Set the objects initial position in the scene
    mMatrix = mat4.translate(mMatrix, [0.5, 0.7, 0.0]);

    // Multiply the mMatrix by the full body transformation matrix first
    mMatrix = mat4.multiply(mMatrix, mvBodyMatrix);
    pushMatrix(mMatrix);


    // Draw rectangles for the right arm

    //   - First push the transformations for the right arm
    mMatrix = mat4.translate(mMatrix, [0.0, -0.75, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvRightArmMatrix);
    mMatrix = mat4.translate(mMatrix, [0.5, 0.0, 0.0]);
    pushMatrix(mMatrix);

    //   - Draw the right forearm, which is dependent on the right arm transformations
    mMatrix = mat4.translate(mMatrix, [0.5, 0.0, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvRightForearmMatrix);
    mMatrix = mat4.translate(mMatrix, [0.6, 0.0, 0.0]);
    pushMatrix(mMatrix);

    mMatrix = mat4.translate(mMatrix, [1.3, 0.0, 0.0]);
    draw_teapot();

    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [1.0, 0.2, 0.25]);
    draw_cube(colorEnum.TAN, lightCoefEnum.MEDIUM);

    //   - Draw the second right arm rectangle (one closer to the body)
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [1.3, 0.25, 0.3]);
    draw_cube(colorEnum.RED, lightCoefEnum.MEDIUM);


    // Draw rectangles for the left arm

    //   - First, get the body mMatrix matrix the arm depends on
    mMatrix = popMatrix();
    pushMatrix(mMatrix);

    //   - Push the transformations for the left arm
    mMatrix = mat4.translate(mMatrix, [0.0, -0.75, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvLeftArmMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0.0, 0.0]);
    pushMatrix(mMatrix);

    //   - Draw the left forearm, which is dependent on the right arm transformations
    mMatrix = mat4.translate(mMatrix, [-0.5, 0.0, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvLeftForearmMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.6, 0.0, 0.0]);
    mMatrix = mat4.scale(mMatrix, [1.0, 0.2, 0.25]);
    draw_cube(colorEnum.TAN, lightCoefEnum.MEDIUM);

    //   - Draw the second left arm rectangle (one closer to the body)
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [1.3, 0.25, 0.3]);
    draw_cube(colorEnum.RED, lightCoefEnum.MEDIUM);


    // Draw the Right Leg

    //   - First, get the body mMatrix matrix the leg depends on
    mMatrix = popMatrix();
    pushMatrix(mMatrix);

    //   - Calculate and push the transform matrix for the whole leg
    mMatrix = mat4.translate(mMatrix, [0.25, -2.0, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvRightLegMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.55, 0.0]);
    pushMatrix(mMatrix);

    //   - Calculate and push the foot matrix that depends on the leg matrix
    mMatrix = mat4.translate(mMatrix, [0.0, -0.5, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvRightFootMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.3, 0.0]);
    pushMatrix(mMatrix);

    //   - Draw black rectangle for shoe
    mMatrix = mat4.translate(mMatrix, [0.0, -0.3, 0.3]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.15, 0.4]);
    draw_cube(colorEnum.BLACK, lightCoefEnum.MEDIUM);

    //   - Draw lower part of the leg
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [0.3, 0.6, 0.3]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
    draw_cylinder(colorEnum.BLUE, lightCoefEnum.MEDIUM);

    //   - Draw upper part of the leg
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [0.4, 1.0, 0.3]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
    draw_cylinder(colorEnum.BLUE, lightCoefEnum.MEDIUM);


    // Draw the Left Leg

    //   - First, get the body mMatrix matrix the leg depends on
    mMatrix = popMatrix();
    pushMatrix(mMatrix);

    //   - Calculate and push the transform matrix for the whole leg
    mMatrix = mat4.translate(mMatrix, [-0.25, -2.0, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvLeftLegMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.55, 0.0]);
    pushMatrix(mMatrix);

    //   - Calculate and push the foot matrix that depends on the leg matrix
    mMatrix = mat4.translate(mMatrix, [0.0, -0.5, 0.0]);
    mMatrix = mat4.multiply(mMatrix, mvLeftFootMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.3, 0.0]);
    pushMatrix(mMatrix);

    //   - Draw black rectangle for shoe
    mMatrix = mat4.translate(mMatrix, [0.0, -0.3, 0.3]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.15, 0.4]);
    draw_cube(colorEnum.BLACK, lightCoefEnum.MEDIUM);

    //   - Draw lower part of the leg
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [0.3, 0.6, 0.3]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
    draw_cylinder(colorEnum.BLUE, lightCoefEnum.MEDIUM);

    //   - Draw upper part of the leg
    mMatrix = popMatrix();
    mMatrix = mat4.scale(mMatrix, [0.4, 1.0, 0.3]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
    draw_cylinder(colorEnum.BLUE, lightCoefEnum.MEDIUM);


    // Draw Body 
    mMatrix = popMatrix();
    pushMatrix(mMatrix);

    mMatrix = mat4.scale(mMatrix, [1.0, 2.0, 1.0]);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.7, 0.0]);
    draw_sphere(colorEnum.RED, lightCoefEnum.MEDIUM);

    // Draw Head
    mMatrix = popMatrix();
    draw_sphere(colorEnum.TAN, lightCoefEnum.MEDIUM);
}


/*
    getCurrentMVMatrix function
        Used in the mouse and key handling functions, retrieve the 
        model view matrix for the corresponding part of the movable object 
        that is currently selected.
*/
function getCurrentMVMatrix() {
    switch (currentPart) {
        case personEnum.BODY:
            return mvBodyMatrix;
        case personEnum.LEFTARM:
            return mvLeftArmMatrix;
        case personEnum.LEFTFOOT:
            return mvLeftFootMatrix;
        case personEnum.LEFTFOREARM:
            return mvLeftForearmMatrix;
        case personEnum.LEFTLEG:
            return mvLeftLegMatrix;
        case personEnum.RIGHTARM:
            return mvRightArmMatrix;
        case personEnum.RIGHTFOOT:
            return mvRightFootMatrix;
        case personEnum.RIGHTFOREARM:
            return mvRightForearmMatrix;
        case personEnum.RIGHTLEG:
            return mvRightLegMatrix;
        default:
            console.error("currentPart is incorrectly set");
            return mvBodyMatrix;
    }
}



/*
    onDocumentMouseDown function
        Function to handle the events for when the mouse is clicked.
        Adds other event listeners depending on what mouse button is clicked.
*/
function onDocumentMouseDown(event) {
    event.preventDefault();

    if (event.button == 0)  // 0 represents left mouse button
    {
        // Add left mouse button event handlers
        document.addEventListener('mousemove', onDocumentLeftMouseMove, false);
        document.addEventListener('mouseup', onDocumentLeftMouseUp, false);
        document.addEventListener('mouseout', onDocumentLeftMouseOut, false);
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        lastMouseX_left = mouseX;
        lastMouseY_left = mouseY;
    }
    else if (event.button == 2) // 2 represents right mouse button
    {
        // Add right mouse button event handlers
        document.addEventListener('mousemove', onDocumentRightMouseMove, false);
        document.addEventListener('mouseup', onDocumentRightMouseUp, false);
        document.addEventListener('mouseout', onDocumentRightMouseOut, false);
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        lastMouseX_right = mouseX;
        lastMouseY_right = mouseY;
    }
}


/*
    Left Mouse button event handlers
        Left mouse button event handlers will alter the Z_angle global variable 
        in order to rotate the entire scene as the mouse moves
*/
function onDocumentLeftMouseMove(event) {
    var mouseX = event.clientX;
    var mouseY = event.clientY; 

    var diffX = mouseX - lastMouseX_left;
    var diffY = mouseY - lastMouseY_left;

    Z_angle = Z_angle + diffX/5;

    lastMouseX_left = mouseX;
    lastMouseY_left = mouseY;

    drawScene();
}

function onDocumentLeftMouseUp(event) {
    document.removeEventListener( 'mousemove', onDocumentLeftMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentLeftMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentLeftMouseOut, false );
}

function onDocumentLeftMouseOut(event) {
    document.removeEventListener('mousemove', onDocumentLeftMouseMove, false);
    document.removeEventListener('mouseup', onDocumentLeftMouseUp, false);
    document.removeEventListener('mouseout', onDocumentLeftMouseOut, false);
}


/*
    Right mouse button event handlers
        Right mouse button event handlers will alter the globalScaling variable
        in order to scale the entire scene based on mouse movement
*/
function onDocumentRightMouseMove(event) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    var diffX = mouseX - lastMouseX_right;
    var diffY = mouseY - lastMouseY_right;

    var increment = 0.01;
    diffY = diffY * increment;

    if (globalScaling[0] + diffY >= 0) {
        globalScaling[0] += diffY;
        globalScaling[1] += diffY;
        globalScaling[2] += diffY;
    }

    lastMouseX_right = mouseX;
    lastMouseY_right = mouseY;

    drawScene();
}

function onDocumentRightMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentRightMouseMove, false);
    document.removeEventListener('mouseup', onDocumentRightMouseUp, false);
    document.removeEventListener('mouseout', onDocumentRightMouseOut, false);
}

function onDocumentRightMouseOut(event) {
    document.removeEventListener('mousemove', onDocumentRightMouseMove, false);
    document.removeEventListener('mouseup', onDocumentRightMouseUp, false);
    document.removeEventListener('mouseout', onDocumentRightMouseOut, false);
}



/*
    onKeyDown function
        The key press handler, which performs transformations based on what keys 
        were pressed. Rotations apply to the currently selected part, while translating
        and scaling apply to the whole movable object so that the movable object parts can't
        be altered and look weird.
*/
function onKeyDown(event) {

    currentMV = getCurrentMVMatrix();

    switch (event.keyCode) {
        case 70:    // f pressed, translate whole object up
            mvBodyMatrix = mat4.translate(mvBodyMatrix, [0, 0.1, 0]);
            break;
        case 66:    // b pressed, translate whole object down
            mvBodyMatrix = mat4.translate(mvBodyMatrix, [0, -0.1, 0]);
            break;
        case 76:    // l pressed, translate whole object left
            mvBodyMatrix = mat4.translate(mvBodyMatrix, [-0.1, 0, 0]);
            break;
        case 82:    // r pressed, translate whole object right
            mvBodyMatrix = mat4.translate(mvBodyMatrix, [0.1, 0, 0]);
            break;
        case 88:    // x pressed, rotate the currently selected part clockwise around Z-axis
            currentMV = mat4.rotate(currentMV, -0.05, [0, 0, 1]);
            break;
        case 90:    // z pressed, rotate the currently selected part counter clockwise around Z-axis
            currentMV = mat4.rotate(currentMV, 0.05, [0, 0, 1]);
            break;
        case 67:    // c pressed, rotate the currently selected part clockwise around Y-axis
            currentMV = mat4.rotate(currentMV, -0.05, [0, 1, 0]);
            break;
        case 86:    // v pressed, rotate the currently selected part counter clockwise around Y-axis
            currentMV = mat4.rotate(currentMV, 0.05, [0, 1, 0]);
            break;
        case 83:    // s pressed, scale the whole object up
            mvBodyMatrix = mat4.scale(mvBodyMatrix, [1.05, 1.05, 1.05]);
            break;
        case 68:    // d pressed, scale the whole object down
            mvBodyMatrix = mat4.scale(mvBodyMatrix, [0.95, 0.95, 0.95]);
            break;

    }

    drawScene();
}


/* 
    webGLStart function
        Called when the body of the HTML loads. Handles calls to initialization functions.
*/
function webGLStart() {
    var canvas = document.getElementById("code03-canvas");
    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    shaderProgram.vertexAmbientCoefAttribute = gl.getAttribLocation(shaderProgram, "aAmbientCoef");
    gl.enableVertexAttribArray(shaderProgram.vertexAmbientCoefAttribute);
    shaderProgram.vertexDiffuseCoefAttribute = gl.getAttribLocation(shaderProgram, "aDiffuseCoef");
    gl.enableVertexAttribArray(shaderProgram.vertexDiffuseCoefAttribute);
    shaderProgram.vertexSpecularCoefAttribute = gl.getAttribLocation(shaderProgram, "aSpecularCoef");
    gl.enableVertexAttribArray(shaderProgram.vertexSpecularCoefAttribute);
    shaderProgram.vertexShininessAttribute = gl.getAttribLocation(shaderProgram, "aShininess");
    gl.enableVertexAttribArray(shaderProgram.vertexShininessAttribute);
    shaderProgram.vertexUVAttribute = gl.getAttribLocation(shaderProgram, "aUVCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
    shaderProgram.cubeMapTextureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");
    shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "useTexture");

    // Initialize our VBOs
    initBuffers();

    // Set the clear color to be a sky blue for our scene
    gl.clearColor(0.0, 0.0, 1.0, 0.3);

    globalScaling = [0.75, 0.75, 0.75];

    // Add event listeners
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onKeyDown, false);

    // Initialize our object part's model-view matrices
    mvMatrix1 = mat4.create();
    mat4.identity(mvMatrix1);

    mvBodyMatrix = mat4.create();
    mat4.identity(mvBodyMatrix);

    mvRightArmMatrix = mat4.create();
    mat4.identity(mvRightArmMatrix);

    mvRightForearmMatrix = mat4.create();
    mat4.identity(mvRightForearmMatrix);

    mvLeftArmMatrix = mat4.create();
    mat4.identity(mvLeftArmMatrix);

    mvLeftForearmMatrix = mat4.create();
    mat4.identity(mvLeftForearmMatrix);

    mvRightLegMatrix = mat4.create();
    mat4.identity(mvRightLegMatrix);

    mvRightFootMatrix = mat4.create();
    mat4.identity(mvRightFootMatrix);

    mvLeftLegMatrix = mat4.create();
    mat4.identity(mvLeftLegMatrix);

    mvLeftFootMatrix = mat4.create();
    mat4.identity(mvLeftFootMatrix);

    currentPart = personEnum.BODY;

    initTextures();
    initJSON();
    initCubeMap();

    drawScene();
}

/*
    redraw function
        Used to reset the scene by setting all model view matrices to the identity matrix
*/
function redraw() {
    Z_angle = 0;
    globalScaling = [0.75, 0.75, 0.75];

    cameraPosition = [0, 0, 5];
    centerOfInterest = [0, 0, 0];
    panAngle = 0;

    light_ambient = [0.5, 0.5, 0.5, 1];
    light_diffuse = [0.5, 0.5, 0.5, 1];
    light_specular = [0.5, 0.5, 0.5, 1];
    light_pos = [0, 0, 5, 1];

    mat4.identity(mvBodyMatrix);
    mat4.identity(mvLeftArmMatrix);
    mat4.identity(mvLeftFootMatrix);
    mat4.identity(mvLeftForearmMatrix);
    mat4.identity(mvLeftLegMatrix);
    mat4.identity(mvRightArmMatrix);
    mat4.identity(mvRightFootMatrix);
    mat4.identity(mvRightForearmMatrix);
    mat4.identity(mvRightLegMatrix);

    drawScene();
}
    
/*
    selectBodyPart function
        Used by the buttons in the HTML code to select different parts of the movable
        object to rotate.
*/
function selectBodyPart(part) {
    currentPart = part;
    drawScene();
}
