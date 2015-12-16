/**
	回顾第一章至第六章内容 旋转的混合纹理贴图
*/

var VShader_Source=
'attribute vec4 a_Position;'+
'attribute vec2 a_TexCoord;'+
'varying vec2 v_TexCoord;'+
'uniform mat4 u_ModelMatrix;'+
'void main(){'+
'	gl_Position=u_ModelMatrix*a_Position;'+
'	v_TexCoord=a_TexCoord;'+
'}';

var FShader_Source=
'precision mediump float;'+
'varying vec2 v_TexCoord;'+
'uniform sampler2D u_Sampler0;'+
'uniform sampler2D u_Sampler1;'+
'void main(){'+
'	gl_FragColor=texture2D(u_Sampler0,v_TexCoord)*texture2D(u_Sampler1,v_TexCoord);'+
'}';

var rotateSpeed=1440.0;
var lastDrawTime=Date.now();

function main () {
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);

	initShaders(gl,VShader_Source,FShader_Source);
	gl.clearColor(0.0,0.0,0.0,1.0);
	var pointNumber=initializePoints(gl);
	initializeTextures(gl);

	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	var modelMatrix=new Matrix4();
	modelMatrix.setRotate(0.0,0,0,1);

	//注意点I:requestAnimationFram()的参数为函数名称，该函数不可带需要赋值的参数
	var drawThread=function() {
		draw(gl,pointNumber,u_ModelMatrix,modelMatrix);
		requestAnimationFrame(drawThread);
	}
	drawThread();
}

function draw(gl,pointNumber,u_ModelMatrix,modelMatrix) {
	modelMatrix.rotate(rotateSpeed*(Date.now()-lastDrawTime)/1000.0%360,0,0,1);
	//注意点II:关于时间统计，需要进行帧更新操作！
	lastDrawTime=Date.now();
	gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN,0,pointNumber);
}

function initializePoints (gl) {
	var points=new Float32Array([
		-0.5,0.5,0.0,1.0,
		-0.5,-0.5,0.0,0.0,
		0.5,-0.5,1.0,0.0,
		0.5,0.5,1.0,1.0
		]);
	var FSIZE=points.BYTES_PER_ELEMENT;
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);

	//注意点III:注意OpenGL ES的命名规则，便于进行API的记忆！
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');

	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);

	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_TexCoord);

	return points.length/4;
}

function initializeTextures (gl) {
	var texture0=gl.createTexture();
	var texture1=gl.createTexture();
	var image0=new Image();
	var image1=new Image();

	image0.src='../Resources/BlendTexture0.png';
	image1.src='../Resources/BlendTexture1.png';
	//进行一次反转操作即可
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,texture0);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D,texture1);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image1);

	var u_Sampler0=gl.getUniformLocation(gl.program,'u_Sampler0');
	var u_Sampler1=gl.getUniformLocation(gl.program,'u_Sampler1');
	gl.uniform1i(u_Sampler0,0);
	gl.uniform1i(u_Sampler1,1);
}