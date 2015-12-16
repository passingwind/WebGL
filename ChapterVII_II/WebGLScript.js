/**
	可旋转的正交投影
*/

var VShader_Source=
'attribute vec4 a_Position;'+
'attribute vec4 a_Color;'+
'uniform mat4 u_ProjMatrix;'+	//投影矩阵
'uniform mat4 u_ViewMatrix;'+	//视口矩阵
'uniform mat4 u_ModelMatrix;'+	//模型矩阵
'varying vec4 v_Color;'+
'void main(){'+
'	gl_Position=u_ProjMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;'+	//MVP的反向顺序绘图，即PVM
'	v_Color=a_Color;'+
'}';

var FShader_Source=
'precision mediump float;'+
'varying vec4 v_Color;'+
'void main(){'+
' gl_FragColor=v_Color;'+
'}';

var g_EyeX=0.2,g_EyeY=0.25,g_EyeZ=0.25;
function main () {
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	initShaders(gl,VShader_Source,FShader_Source);
	gl.clearColor(0.0,0.0,0.0,1.0);
	var pointNumber=initializePoints(gl);
	//设置投影矩阵
	var u_ProjMatrix=gl.getUniformLocation(gl.program,'u_ProjMatrix');
	var viewMatrix=new Matrix4();
	viewMatrix.setOrtho(-1,1,-1,1,-1,2);	//定义正交投影
	gl.uniformMatrix4fv(u_ProjMatrix,false,viewMatrix.elements);
	//视图矩阵
	var u_ViewMatrix=gl.getUniformLocation(gl.program,'u_ViewMatrix');
	//设置旋转矩阵
	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	viewMatrix.setRotate(-10,0,0,1);
	gl.uniformMatrix4fv(u_ModelMatrix,false,viewMatrix.elements);
	//注册键盘相应事件
	document.onkeydown=function(ev) {
		rotateEye(ev,gl,pointNumber,u_ViewMatrix,viewMatrix);
	}
	draw(gl,pointNumber,u_ViewMatrix,viewMatrix);
}

//旋转观测点函数
function rotateEye (ev,gl,pointNumber,u_ViewMatrix,viewMatrix) {
	if(ev.keyCode==39)
		g_EyeX+=0.01;
	else if(ev.keyCode==37)
		g_EyeX-=0.01;
	if(ev.keyCode==38)
		g_EyeY+=0.01;
	else if(ev.keyCode==40)
		g_EyeY-=0.01;
	draw(gl,pointNumber,u_ViewMatrix,viewMatrix);
}

//绘图函数
function draw(gl,pointNumber,u_ViewMatrix,viewMatrix)
{
	viewMatrix.setLookAt(g_EyeX,g_EyeY,g_EyeZ,0,0,0,0,1,0);
	gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,pointNumber);
}

//顶点装配
function initializePoints (gl) {
	var points=new Float32Array([
			0.0,0.5,-0.4,0.4,1.0,0.4,	//最后面的绿色三角形
			-0.5,-0.5,-0.4,0.4,1.0,0.4,
			0.5,-0.5,-0.4,1.0,0.4,0.4,

			0.5,0.4,-0.2,1.0,0.4,0.4,	//中间的是黄色三角形
			-0.5,0.4,0.2,1.0,1.0,0.4,
			0.0,-0.6,-0.2,1.0,1.0,0.4,

			0.0,0.5,0.0,0.4,0.4,1.0,	//最前面的是蓝色三角形
			-0.5,-0.5,0.0,0.4,0.4,1.0,
			0.5,-0.5,0.0,1.0,0.4,0.4
		]);
	var FSIZE=points.BYTES_PER_ELEMENT;
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_Color=gl.getAttribLocation(gl.program,'a_Color');
	gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,FSIZE*6,0);
	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_Color);
	return points.length/6;
}