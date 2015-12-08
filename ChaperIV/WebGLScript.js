//全局顶点着色器
var VSHADER_SOURCE=
'attribute vec4 a_Position;'+
'uniform mat4 u_Matrix;'+
'void main(){'+
'	gl_Position=u_Matrix * a_Position;'+
'	gl_PointSize=10.0;'+
'}';
//全局片元着色器
var FSHADER_SOURCE=
'precision mediump float;'+
'uniform vec4 u_FragColor;'+
'void main(){'+
'	gl_FragColor=u_FragColor;'+
'}';

//指定旋转速度(°/s)
var rotateSpeed=45.0;
var lastDraw=Date.now();

//WebGL入口脚本
function main()
{
	//获取画布与绘图环境（以下均无错误检查）
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	//初始化着色器，构建程序
	initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE);
	//设置着色器缓存区以及绘制的顶点数
	var pointNumber=initializePoints(gl);
	//设置背景颜色
	gl.clearColor(0.0,0.0,0.0,1.0);
	
	var currentAngle=0.0;
	var modelMatrix=new Matrix4();
	var u_Matrix=gl.getUniformLocation(gl.program,'u_Matrix');

	var drawThread=function()
	{
		draw(gl,pointNumber,modelMatrix,u_Matrix,currentAngle);
		requestAnimationFrame(drawThread);
	};
	drawThread();
}

//绘图函数
function draw(gl,pointNumber,modelMatrix,u_Matrix,currentAngle)
{
	//清空缓冲区
	gl.clear(gl.COLOR_BUFFER_BIT);
	//计算增量角度
	var deltaTime=Date.now()-lastDraw;
	lastDraw=Date.now();
	currentAngle+=deltaTime*rotateSpeed/1000;
	//进行矩阵变换
	modelMatrix.rotate(currentAngle%360,0,0,1);
	gl.uniformMatrix4fv(u_Matrix,false,modelMatrix.elements);
	//绘图操作
	gl.drawArrays(gl.TRIANGLES,0,pointNumber);
}

//构造顶点缓冲区与设置变换矩阵
function initializePoints(gl)
{
	//创建顶点数组
	var points=new Float32Array([0.0,0.5,-0.5,-0.5,0.5,-0.5]);
	//创建顶点缓冲区
	var vertices=gl.createBuffer();
	//将顶点缓冲区绑定到WebGL系统
	gl.bindBuffer(gl.ARRAY_BUFFER,vertices);
	//向绑定好的顶点缓冲区拷贝顶点数据
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);

	//设置着色器变量的属性
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var u_FragColor=gl.getUniformLocation(gl.program,'u_FragColor');
	//属性赋值
	gl.uniform4f(u_FragColor,1.0,0.0,0.0,1.0);
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);

	return points.length/2;
}