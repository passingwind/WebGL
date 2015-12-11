/**
	纹理图像的操作
*/

//定义顶点着色器与片元着色器
var VShader_Source=
'attribute vec4 a_Position;'+
'attribute vec2 a_TextCoord;'+	//纹理坐标
'varying vec2 v_TexCoord;'+		//用于插值传递
'void main(){'+
'	gl_Position=a_Position;'+
'	v_TexCoord=a_TextCoord;'+
'}';

var FShader_Source=
'precision mediump float;'+
'varying vec2 v_TexCoord;'+
'uniform sampler2D u_Sampler1;'+	//纹理图片1
'uniform sampler2D u_Sampler2;'+	//纹理图片2
'void main(){'+
'	gl_FragColor=texture2D(u_Sampler1,v_TexCoord)*texture2D(u_Sampler2,v_TexCoord);'+	//颜色混合
'}';

//入口函数
function main () {
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	initShaders(gl,VShader_Source,FShader_Source);
	var pointNumber=initializePoints(gl);

	initTextures(gl,pointNumber);
}

function initializePoints (gl) {
	//同前几章操作
	var points=new Float32Array([-0.5,0.5,0.0,1.0,-0.5,-0.5,0.0,0.0,0.5,-0.5,1.0,0.0,0.5,0.5,1.0,1.0]);
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);
	var FSIZE=points.BYTES_PER_ELEMENT;
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_TextCoord=gl.getAttribLocation(gl.program,'a_TextCoord');
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
	gl.vertexAttribPointer(a_TextCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_TextCoord);
	return points.length/4;
}

//两张图片的状态
var texture1OK=false;
var texture2OK=false;

function initTextures (gl,pointNumber) {
	//创建纹理对象
	var texture1=gl.createTexture();
	var texture2=gl.createTexture();
	//获取片元着色器的属性
	var u_Sampler1=gl.getUniformLocation(gl.program,'u_Sampler1');
	var u_Sampler2=gl.getUniformLocation(gl.program,'u_Sampler2');
	//创建图片对象
	var image1=new Image();
	var image2=new Image();
	//注册异步回调函数
	image1.onload=function() {
		setTexture(gl,pointNumber,texture1,image1,u_Sampler1,0);
	};
	image2.onload=function() {
		setTexture(gl,pointNumber,texture2,image2,u_Sampler2,1);
	};
	//指定src后，系统将进行加载，加载完毕后调用回调函数
	image1.src='../Resources/BlendTexture1.png';
	image2.src='../Resources/BlendTexture2.png';
	return;
}

//设置纹理单元
function setTexture (gl,pointNumber,texture,image,u_Sampler,index) {
	//翻转纹理对象的Y轴
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	//判断是哪个图片
	if(index==0)
	{
		//激活纹理单元
		gl.activeTexture(gl.TEXTURE0);
		texture1OK=true;
	}	
	else
	{
		gl.activeTexture(gl.TEXTURE1);
		texture2OK=true;
	}
	//绑定纹理到系统内置类型区域
	gl.bindTexture(gl.TEXTURE_2D,texture);
	//设置纹理对象参数
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	//设置纹理图片参数
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
	//将纹理单元的下标传递给片元着色器
	gl.uniform1i(u_Sampler,index);
	//如果两幅图片均加载完成，则进行绘制
	if(texture1OK&&texture2OK)
		gl.drawArrays(gl.TRIANGLE_FAN,0,pointNumber);
}



