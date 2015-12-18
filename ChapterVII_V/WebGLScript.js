/**
	第七章及之前 立方体绘制以及纹理贴图练习
	总结：出现莫名其妙的错误一般是因为函数名打错了...T_T
*/

//顶点着色器
var VShader_Source=
'attribute vec4 a_Position;'+	//顶点坐标
'attribute vec2 a_TexCoord;'+	//纹理坐标
'varying vec2 v_TexCoord;'+		//纹理插值坐标
'uniform mat4 u_ModelMatrix;'+	//模型矩阵
'uniform mat4 u_ViewMatrix;'+	//视图矩阵
'uniform mat4 u_ProjMatrix;'+	//投影矩阵
'void main(){'+
'	gl_Position=u_ProjMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;'+	//PVM的顺序相乘
'	v_TexCoord=a_TexCoord;'+
'}';

//片元着色器
var FShader_Source=
'precision mediump float;'+
'varying vec2 v_TexCoord;'+
'uniform sampler2D u_Sampler;'+
'void main(){'+
'	gl_FragColor=texture2D(u_Sampler,v_TexCoord);'+
'}';

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
	//绘图
	draw(gl,pointNumber);
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

//绘图函数
function draw(gl,pointNumber) 
{
	gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES,pointNumber,gl.UNSIGNED_BYTE,0);
}