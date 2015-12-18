/**
	第八章：光照————带旋转的逐顶点进行法向量平行光照计算
*/

//顶点着色器
var VShader_Source=
'attribute vec4 a_Position;'+		//顶点坐标
'attribute vec2 a_TexCoord;'+		//纹理坐标
'attribute vec4 a_Normal;'+			//法向量
'uniform vec3 u_LightColor;'+		//光线颜色
'uniform vec3 u_LightDirection;'+	//光线方向
'uniform mat4 u_ModelMatrix;'+		//模型矩阵
'uniform mat4 u_ViewMatrix;'+		//视图矩阵
'uniform mat4 u_ProjMatrix;'+		//投影矩阵
'uniform mat4 u_RotateMatrix;'+		//法向量旋转矩阵
'varying vec2 v_TexCoord;'+			//纹理插值坐标
'varying vec3 v_LightColor;'+		//平行光颜色
'void main(){'+
'	gl_Position=u_ProjMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;'+	//PVM的顺序相乘
'	vec3 normal=normalize(vec3(u_RotateMatrix*a_Normal));'+		//变换旋转矩阵
'	v_TexCoord=a_TexCoord;'+
'	v_LightColor=u_LightColor*max(dot(u_LightDirection,normal),0.0);'+	//计算入射光线与夹角乘积
'}';

//片元着色器
var FShader_Source=
'precision mediump float;'+		//片元着色器中的flaot需要自己指定精度
'varying vec2 v_TexCoord;'+		//插值后的纹理坐标
'varying vec3 v_LightColor;'+	//平行光的颜色
'uniform sampler2D u_Sampler;'+	//纹理取样器
'uniform vec3 u_AmbietLight;'+	//环境光
'void main(){'+
'	vec4 baseColor=texture2D(u_Sampler,v_TexCoord);'+	//从纹理中取得颜色作为底色
'	vec3 ambientColor=baseColor.rgb*u_AmbietLight;'+	//计算环境光与底色叠加后的光线颜色
'	gl_FragColor=vec4(baseColor.rgb*v_LightColor,baseColor.a)+vec4(ambientColor,baseColor.a);'+	//最终颜色为漫反射+环境光
'}';


var rotateX=0.0,rotateZ=0.0;	//记录当前旋转值
var rotateSpeed=1.0;			//旋转速度

function main() 
{
	//获取绘图环境
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	//设置背景颜色
	gl.clearColor(0.0,0.0,0.0,1.0);
	//启用深度测试
	gl.enable(gl.DEPTH_TEST);	
	initShaders(gl,VShader_Source,FShader_Source);
	//顶点装配
	var pointNumber=initializePoints(gl);
	//纹理绑定
	initializeTexture(gl,pointNumber);
	//矩阵设置
	initializeMatrixs(gl);
	//光照设置
	initializeLighting(gl);
	//获取法向量旋转矩阵与模型矩阵（用于动态更新平行光照）
	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	var u_RotateMatrix=gl.getUniformLocation(gl.program,'u_RotateMatrix');
	var modelMatrix=new Matrix4();
	var rotateMatrix=new Matrix4();
	//注册回调事件（按下指定的方向键后更新状态并重新绘图）
	document.onkeydown=function(ev) 
	{
		//处理绕X轴旋转
		if(ev.keyCode==38)
			rotateX-=rotateSpeed;
		else if(ev.keyCode==40)
			rotateX+=rotateSpeed;
		//处理绕Z轴旋转
		if(ev.keyCode==37)
			rotateZ+=rotateSpeed;
		else if(ev.keyCode==39)
		rotateZ-=rotateSpeed;
		draw(gl,pointNumber,u_ModelMatrix,modelMatrix,u_RotateMatrix,rotateMatrix);
	}
	//绘图
	draw(gl,pointNumber,u_ModelMatrix,modelMatrix,u_RotateMatrix,rotateMatrix);
}

//初始化顶点
function initializePoints (gl) 
{
	//顶点坐标数组，共24个顶点，不含纹理，纹理将分开绑定
	var vertices=new Float32Array([
			1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,	//第一个面
			1.0,1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,	//第二个面
			1.0,1.0,1.0,1.0,1.0,-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,	//第三个面
			-1.0,1.0,1.0,-1.0,1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,1.0,//第四个面
			-1.0,-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,-1.0,-1.0,1.0,//第五个面
			1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0	//第六个面
		]);
	//纹理坐标数组
	var textures=new Float32Array([
			1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,	//第一个面
			0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,	//第二个面
			0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,	//第三个面
			1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,	//第四个面
			0.0,0.0,0.0,1.0,1.0,1.0,1.0,0.0,	//第五个面
			0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0		//第六个面
		]);
	//索引数组，注意类型为Uint(unsigned int)
	var indexs=new Uint8Array([
			0,1,2,0,2,3,		//第一个面
			4,5,6,4,6,7,		//第二个面
			8,9,10,8,10,11,		//第三个面
			12,13,14,12,14,15,	//第四个面
			16,17,18,16,18,19,	//第五个面
			20,21,22,20,22,23	//第六个面
		]);
	//绑定顶点坐标
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var vertexBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);
	//绑定纹理坐标
	var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');
	var textureBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,textures,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_TexCoord);
	//绑定索引数组
	var indexBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexs,gl.STATIC_DRAW);
	//返回索引长度
	return indexs.length;
}

//初始化纹理
function initializeTexture(gl,pointNumber) 
{
	//创建纹理对象
	var texture=gl.createTexture();
	//创建图片对象
	var image=new Image();
	//加载图片
	image.src='../Resources/Texture.png';
	var u_Sampler=gl.getUniformLocation(gl.program,'u_Sampler');
	//反转图片的Y轴
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,texture);
	//设置纹理对象的属性
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	//设置图片属性
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
	gl.uniform1i(u_Sampler,0);
}

//初始化各个矩阵
function initializeMatrixs(gl)
{
	//投影矩阵
	var projMatrix=new Matrix4();
	projMatrix.setPerspective(30.0,1.0,1,100);
	var u_ProjMatrix=gl.getUniformLocation(gl.program,'u_ProjMatrix');
	gl.uniformMatrix4fv(u_ProjMatrix,false,projMatrix.elements);
	//视图矩阵
	var viewMatrix=new Matrix4();
	viewMatrix.setLookAt(3,3,7,0,0,0,0,1,0);
	var u_ViewMatrix=gl.getUniformLocation(gl.program,'u_ViewMatrix');
	gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);
	//模型矩阵
	var modelMatrix=new Matrix4();
	modelMatrix.setRotate(0,0,0,1);
	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
}

function initializeLighting (gl) 
{
	var normalArray=new Float32Array([
			0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
			1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,
			0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,
			-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,
			0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,
			0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0
		]);
	//设置法向量
	var a_Normal=gl.getAttribLocation(gl.program,'a_Normal');
	var normalBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,normalArray,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Normal,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Normal);
	//设置平行光颜色
	var u_LightColor=gl.getUniformLocation(gl.program,'u_LightColor');
	gl.uniform3f(u_LightColor,0.2,0.2,0.7);
	//设置平行光方向
	var u_LightDirection=gl.getUniformLocation(gl.program,'u_LightDirection');
	gl.uniform3f(u_LightDirection,0.5,3.0,4.0);
	//设置环境光
	var u_AmbietLight=gl.getUniformLocation(gl.program,'u_AmbietLight');
	gl.uniform3f(u_AmbietLight,0.2,0.4,0.8);
}

//绘图函数
function draw(gl,pointNumber,u_ModelMatrix,modelMatrix,u_RotateMatrix,rotateMatrix) 
{
	//矩阵的设置
	modelMatrix.setRotate(rotateX,1,0,0).rotate(rotateZ,0,0,1);
	gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
	rotateMatrix.setInverseOf(modelMatrix).transpose();
	gl.uniformMatrix4fv(u_RotateMatrix,false,rotateMatrix.elements);
	//绘图
	gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES,pointNumber,gl.UNSIGNED_BYTE,0);
}