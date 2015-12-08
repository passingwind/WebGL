/**
	非IDE环境下注意API的拼写错误问题！
*/

//设置着色器（C语言类型字符串）
var VSHADER_SOURCE=
'attribute vec4 a_Position;'+
'attribute float a_PointSize;'+
'void main()'+
'{'+
	'gl_Position=a_Position;'+
	'gl_PointSize=a_PointSize;'+
'}';
//片元着色器必须有精度控制
var FSHADER_SOURCE=
'precision mediump float;'+
'uniform vec4 u_FragColor;'+
'void main()'+
'{'+
	'gl_FragColor=u_FragColor;'+
'}';

function main()
{
	//获取canvas对象
	var canvas=document.getElementById('WebGL');
	//获取绘图上下文
	var gl=getWebGLContext(canvas);
	if(!gl)
	{
		console.log('Failed to get the rendering context for WebGL!');
		return;
	}
	//初始化顶点着色器与片元着色器
	if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE))
	{
		console.log('Failed to initialize shaders!');
		return;
	}
	//获取顶点着色器中的属性变量(为空返回-1)
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	if(a_Position<0)
	{
		console.log('Failed to get attribute a_Position!');
	}
	var a_PointSize=gl.getAttribLocation(gl.program,'a_PointSize');
	if(a_PointSize<0)
	{
		console.log('Failed to get attribute a_PointSize!');
	}
	//获取片元着色器中的属性变量(如果为空，返回null)
	var u_FragColor=gl.getUniformLocation(gl.program,'u_FragColor');
	if(!u_FragColor)
	{
		console.log('Failed to get uniform u_FragColor!');
	}
	canvas.onmousedown=function(ev){click(ev,gl,canvas,a_Position,a_PointSize,u_FragColor);}

	//指定canvas的背景色
	gl.clearColor(0,0,0,1.0);
	//清空canvas
	gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points=[];
var g_colors=[];
function click(ev,gl,canvas,a_Position,a_PointSize,u_FragColor)
{
	//几种元素坐标系之间的转换
	var x=ev.clientX;
	var y=ev.clientY;
	var rect=ev.target.getBoundingClientRect();

	x=(x-rect.left-canvas.width/2)/(canvas.width/2);
	y=(canvas.height/2-(y-rect.top))/(canvas.height/2);
	//每次将点进行保存
	g_points.push([x,y]);
	g_colors.push([x,y,x+y-0.5,1.0]);
	//开始绘图
	gl.clear(gl.COLOR_BUFFER_BIT);
	var len=g_points.length;
	for (var i = 0; i < len; ++i) {
		//设置属性变量
		var xy=g_points[i];
		var rgba=g_colors[i];
		gl.vertexAttrib3f(a_Position,xy[0],xy[1],0.0);
		gl.vertexAttrib1f(a_PointSize,i);
		gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3],rgba[4]);
		//绘图部分
		gl.drawArrays(gl.POINTS,0,1);
	};
}