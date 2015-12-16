/**
	复习WebGL GLSL ES语法以及纹理坐标的表示（带纹理的旋转）

*/
//顶点着色器
var VShader_Source=
'attribute vec2 a_TexCoord;'+
'attribute vec4 a_Position;'+
'uniform mat4 u_ModelMatrix;'+
'varying vec2 v_TexCoord;'+
'void main(){'+
' gl_Position=u_ModelMatrix*a_Position;'+
' v_TexCoord=a_TexCoord;'+
'}';

//片元着色器
var FShader_Source=
'precision mediump float;'+
'varying vec2 v_TexCoord;'+
'uniform sampler2D u_Sampler;'+
'void main(){'+
' gl_FragColor=texture2D(u_Sampler,v_TexCoord);'+
'}';

//设置旋转速度
var rotateSpeed=45.0;
//入口函数
function main () 
{
	//获取绘图环境
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	initShaders(gl,VShader_Source,FShader_Source);
	//设置背景色
	gl.clearColor(0.0,0.0,0.0,1.0);
	//装配顶点信息
	var pointNumber=initializePoints(gl);
	initializeTextures(gl);
	//设置旋转矩阵
	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	var modelMatrix=new Matrix4();
	modelMatrix.setRotate(0.0,0,0,1);
	//模拟绘图线程
	var drawThread=function() {
		draw(gl,pointNumber,u_ModelMatrix,modelMatrix);
		requestAnimationFrame(drawThread);
	}
	//开启绘图
	drawThread();
}


//装配顶点信息
function initializePoints (gl) 
{
	//顶点坐标与纹理坐标信息
	var points=new Float32Array([
			-0.5,0.5,0.0,1.0,
			-0.5,-0.5,0.0,0.0,
			0.5,-0.5,1.0,0.0,
			0.5,0.5,1.0,1.0
		]);
	var FSIZE=points.BYTES_PER_ELEMENT;
	//创建于绑定缓冲区
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	//向缓冲区拷贝数据
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);	
	//绑定坐标信息
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');

	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
	//!!!注意顶点属性指定的开启！
	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_TexCoord);
	//返回顶点的个数
	return points.length/4;
}

var loadEnded=false;
//加载纹理图片
function initializeTextures (gl) {
	//创建纹理对象
	var texture=gl.createTexture();
	//创建图片对象
	var image=new Image();
	//同步加载图片
	image.src='../Resources/Texture.png';
	//反转图片Y轴
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	//激活纹理单元
	gl.activeTexture(gl.TEXTURE0);
	//绑定纹理
	gl.bindTexture(gl.TEXTURE_2D,texture);
	//设置纹理属性
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	//设置图片属性
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
	//获取取样器对象
	var u_Samlper=gl.getUniformLocation(gl.program,'u_Samlper');
	//为取样器对象指定纹理单元
	gl.uniform1i(u_Samlper,0);
}

var lastTime=Date.now();
//绘图函数
function draw(gl,pointNumber,u_ModelMatrix,modelMatrix)
{
	//(0,0,1)为绕Z轴旋转
	modelMatrix.rotate((Date.now()-lastTime)*rotateSpeed/1000.0,0,0,1);
	lastTime=Date.now();
	//为矩阵赋值
	gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
	//开始绘图
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN,0,pointNumber);
}