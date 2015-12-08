//定义顶点着色器与片元着色器
var VSHADER_SOURCE=
'attribute vec4 a_Position;'+
'uniform mat4 u_Matrix;'+
'void main()'+
'{'+
	'gl_Position=u_Matrix*a_Position;'+
	'gl_PointSize=10.0;'+
'}';

var FSHADER_SOURCE=
'precision mediump float;'+
'uniform vec4 u_FragColor;'+
'void main()'+
'{'+
'	gl_FragColor=u_FragColor;'+
'}';

var ANGLE=45.0;
function main()
{
	//获取canvas元素
	var canvas=document.getElementById('WebGL');

	//获取绘图环境
	var gl=getWebGLContext(canvas);
	//初始化Shaders
	initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)
	//创建顶点缓冲区（顶点阵列）
	var n=initVertexBuffer(gl);
	//设置canvas背景颜色
	gl.clearColor(0.0,0.0,0.0,1.0);
	//清空canvas内容
	gl.clear(gl.COLOR_BUFFER_BIT);
	//绘图处理（画出来的点必须经过顶点着色器与片元着色器的处理）
	gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffer(gl)
{
	//创建顶点数组(此处采用了Float32Array进行的数据类型特化)
	var vertices=new Float32Array([0.0,0.5,-0.5,-0.5,0.5,-0.5]);
	//创建顶点缓存区
	var vertexBuffer=gl.createBuffer();
	//绑定顶点缓冲区到WebGL系统中已经存在的target上（gl.ARRAY_BUFFER或gl.ELEMENT_ARRAY_BUFFER）
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	//向绑定到的WebGL系统对象内拷贝数据（gl.STATIC_DRAW表示写入一次，绘制多次，正确制定有利于提高效率）
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	//获取变量
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var u_Matrix=gl.getUniformLocation(gl.program,'u_Matrix');
	var u_FragColor=gl.getUniformLocation(gl.program,'u_FragColor');
	//设置着色器属性的值
	//计算旋转角度的Sin,cos值，用于组装变换矩阵
	var degree=Math.PI*ANGLE/180.0;
	var u_Cos=Math.cos(degree);
	var u_Sin=Math.sin(degree);
	var matrixArray=new Float32Array(
		[u_Cos,u_Sin,0.0,0.0,
		-u_Sin,u_Cos,0.0,0.0,
		0.0,0.0,1.0,0.0,
		0.0,0.0,0.0,1.0]);
	//用于mat变量赋值，后缀v表示接受向量参数
	gl.uniformMatrix4fv(u_Matrix,false,matrixArray);
	gl.uniform4f(u_FragColor,0.0,1.0,0.0,1.0);
	//将缓冲区对象指针分配给attribute属性（指针赋值）
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	//开启attribute变量
	gl.enableVertexAttribArray(a_Position);

	return vertices.length/2;
}