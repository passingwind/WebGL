/**
	简单的渲染管线练习——绘制旋转的渐变矩形
*/

/*
	在顶点着色器与片元着色器中声明相同名字的varying变量，片元着色器将自动获取顶点着色器插值后的数值
*/

//全局顶点着色器
var VSHADER_SOURCE=
'attribute vec4 a_Position;'+
'attribute vec4 a_Color;'+
'varying vec4 v_Color;'+	//vary变量进行了内插值
'uniform mat4 u_Matrix;'+
'void main(){'+
	'gl_Position=u_Matrix*a_Position;'+
	'v_Color=a_Color;'+
'}';

//全局片元着色器
var FSHADER_SOURCE=
'precision mediump float;'+
'varying vec4 v_Color;'+	//光栅化过程中将值进行了内插处理，进入片元着色器的时候，值已经发生了变化
'void main(){'+
	'gl_FragColor=v_Color;'+
'}';

//旋转速度，单位:°/s
var rotateSpeed=45.0;
var lastDrawTime=Date.now();

function main()
{
	//获取canvas元素
	var canvas=document.getElementById('WebGL');
	//获取绘图环境
	var gl=getWebGLContext(canvas);
	//初始化Shaders
	initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE);

	//初始化顶点数据
	var pointCount=initializePoints(gl);

	//获得当前顶点着色器矩阵参数的地址
	var u_Matrix=gl.getUniformLocation(gl.program,'u_Matrix');
	var modelMatrix=new Matrix4();
	var currentAngle=0.0;

	//设置被背景颜色
	gl.clearColor(0.0,0.0,0.0,1.0);
	
	//定义绘图函数
	var drawThread=function()
	{
		currentAngle=updateAngle(currentAngle);
		draw(gl,currentAngle,u_Matrix,modelMatrix,pointCount);
		requestAnimationFrame(drawThread);
	}
	//启动绘图函数
	drawThread();
}

//绘制图形,更新旋转状态
function draw(gl,currentAngle,u_Matrix,modelMatrix,pointCount)
{
	modelMatrix.setRotate(currentAngle,0,0,1);
	gl.uniformMatrix4fv(u_Matrix,false,modelMatrix.elements);
	gl.clear(gl.COLOR_BUFFER_BIT);
	//切记第三个参数为顶点数量，而不是图形数量！
	gl.drawArrays(gl.TRIANGLE_FAN,0,pointCount);
}

//更新旋转角度
function updateAngle(currentAngle)
{
	var deltaTime=Date.now()-lastDrawTime;
	lastDrawTime=Date.now();
	currentAngle+=deltaTime*rotateSpeed/1000.0;
	return currentAngle%360;
}


//初始化顶点数据
function initializePoints(gl)
{
	//定义矩形的四个顶点的位置信息与颜色信息，按照逆时针的方向绘制
	var points=new Float32Array(
		[-0.5,0.5,1.0,0.0,0.0,
		 -0.5,-0.5,0.0,1.0,0.0,
		 0.5,-0.5,0.0,0.0,1.0,
		 0.5,0.5,1.0,1.0,1.0
		]);
	//用来获取每个元素的大小，用于计算偏移数据
	var FSIZE=points.BYTES_PER_ELEMENT;
	//创建顶点缓冲区
	var buffer=gl.createBuffer();
	//绑定顶点缓冲区到WebGL系统
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	//向绑定好的缓冲区复制数据
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);

	//设置着色器的属性
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_Color=gl.getAttribLocation(gl.program,'a_Color');

	//将缓冲区对象以不同的偏移和步进方式制定给attribute变量
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*5,0);
	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*5,FSIZE*2);
	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_Color);

	return points.length/5;
} 