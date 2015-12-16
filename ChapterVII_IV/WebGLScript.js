/**
	可旋转的带纹理正方体（索引绘图的方式）
*/

//顶点着色器
var VShader_Source=
'attribute vec4 a_Position;'+	//顶点位置
'attribute vec2 a_TexCoord;'+	//纹理坐标
'uniform mat4 u_ProjMatrix;'+	//投影矩阵
'uniform mat4 u_ViewMatrix;'+	//视口矩阵
'uniform mat4 u_ModelMatrix;'+	//模型矩阵
'varying vec2 v_TexCoord;'+		//插值纹理坐标
'void main(){'+
'	gl_Position=u_ProjMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;'+	//MVP的反向顺序绘图，即PVM的顺序进行矩阵相乘
'	v_TexCoord=a_TexCoord;'+
'}';

//片元着色器
var FShader_Source=
'precision mediump float;'+
'varying vec2 v_TexCoord;'+
'uniform sampler2D u_Sampler;'+
'void main(){'+
' gl_FragColor=texture2D(u_Sampler,v_TexCoord);'+
'}';

//分别绕X，Z轴的旋转角度
var rotateX=0.0,rotateZ=0.0;
//旋转速度
var rotateSpeed=1.0;

function main () 
{
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	initShaders(gl,VShader_Source,FShader_Source);
	//设置背景颜色
	gl.clearColor(0.0,0.0,0.0,1.0);
	//开启深度测试
	gl.enable(gl.DEPTH_TEST);
	//开启多边形偏移
	gl.enable(gl.POLYGON_OFFSET_FILL);
	//装配顶点
	var pointNumber=initializePoints(gl);
	//装配纹理
	initializeTexture(gl);
	//设置投影矩阵
	var u_ProjMatrix=gl.getUniformLocation(gl.program,'u_ProjMatrix');
	var ProjMatrix=new Matrix4();
	ProjMatrix.setPerspective(30,canvas.width/canvas.height,1,100);	//定义透视投影
	gl.uniformMatrix4fv(u_ProjMatrix,false,ProjMatrix.elements);
	//视图矩阵
	var u_ViewMatrix=gl.getUniformLocation(gl.program,'u_ViewMatrix');
	var viewMatrix=new Matrix4();
	viewMatrix.setLookAt(3,3,7,0,0,0,0,1,0);
	gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);
	//设置旋转矩阵
	var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
	var modelMatrix=new Matrix4();
	//注册键盘相应事件
	document.onkeydown=function(ev) {
		rotateCube(ev,gl,pointNumber,u_ModelMatrix,modelMatrix);
	}

	draw(gl,pointNumber,u_ModelMatrix,modelMatrix);
}

//旋转观测点函数
function rotateCube (ev,gl,pointNumber,u_ModelMatrix,modelMatrix) {
	//处理绕X轴旋转
	if(ev.keyCode==38)
		rotateX+=rotateSpeed;
	else if(ev.keyCode==40)
		rotateX-=rotateSpeed;
	//处理绕Z轴旋转
	if(ev.keyCode==37)
		rotateZ+=rotateSpeed;
	else if(ev.keyCode==39)
		rotateZ-=rotateSpeed;
	draw(gl,pointNumber,u_ModelMatrix,modelMatrix);
}

//绘图函数
function draw(gl,pointNumber,u_ModelMatrix,modelMatrix)
{
	modelMatrix.setRotate(rotateX,1,0,0).rotate(rotateZ,0,0,1);
	gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES,pointNumber,gl.UNSIGNED_BYTE,0);
}

//顶点装配(较为复杂，实际作业时,多采用三维建模软件来导入模型)
function initializePoints (gl) 
{
	//顶点数组，共24个顶点，不含纹理，纹理将分开绑定
	var vertices=new Float32Array([
			1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,	//第一个面
			1.0,1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,
			1.0,1.0,1.0,1.0,1.0,-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,
			-1.0,1.0,1.0,-1.0,1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,1.0,
			-1.0,-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,-1.0,-1.0,1.0,
			1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0
		]);
	var textures=new Float32Array([
			1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,	//第一个面
			0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,
			0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,
			1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,
			0.0,0.0,0.0,1.0,1.0,1.0,1.0,0.0,
			0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0
		]);
	var indexs=new Uint8Array([
			0,1,2,0,2,3,	//第一个面
			4,5,6,4,6,7,
			8,9,10,8,10,11,
			12,13,14,12,14,15,
			16,17,18,16,18,19,
			20,21,22,20,22,23
		]);
	//绑定顶点数组
	var vertexBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);
	//绑定纹理坐标
	var textureBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,textures,gl.STATIC_DRAW);
	var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_TexCoord);
	//绑定索引数组
	var indexBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexs,gl.STATIC_DRAW);

	return indexs.length;
}

//装配纹理
function initializeTexture (gl) 
{
	var texture=gl.createTexture();
	var image=new Image();
	image.src='../Resources/CubeTexture.png';
	var u_Sampler=gl.getUniformLocation(gl.program,'u_Sampler');
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,texture);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
	gl.uniform1i(u_Sampler,0);
}