/**
	复习WebGL GLSL ES语法以及纹理坐标的表示
*/

//顶点着色器
var VShader_Source=
'attribute vec2 a_TexCoord;'+
'attribute vec4 a_Position;'+
'varying vec2 v_TexCoord;'+
'void main(){'+
' gl_Position=a_Position;'+
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

//入口函数
function main () {
	var canvas=document.getElementById('WebGL');
	var gl=getWebGLContext(canvas);
	initShaders(gl,VShader_Source,FShader_Source);
	var pointNumber=initializePoints(gl);
	initTexture(gl,pointNumber);
}

//初始顶点信息
function initializePoints (gl) {
	var points=new Float32Array([
			-0.5,0.5,0.0,1.0,
			-0.5,-0.5,0.0,0.0,
			0.5,-0.5,1.0,0.0,
			0.5,0.5,1.0,1.0
		]);
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);
	var FSIZE=points.BYTES_PER_ELEMENT;
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_TexCoord);
	return points.length/4;
}

//初始化纹理配置
function initTexture (gl,pointNumber) {
	var texture=gl.createTexture();
	var image=new Image();
	var u_Sampler=gl.getUniformLocation(gl.program,'u_Sampler');
	image.onload=function() {
		setTexture(gl,pointNumber,u_Sampler,texture,image);
	}
	image.src='../Resources/Texture.png';
}

//设置纹理贴图（牢记两个设置参数的函数：gl.texParameteri(),gl.texImage2D()）
function setTexture (gl,pointNumber,sampler,texture,image) {
	//反转纹理图片Y轴
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
	//激活纹理单元
	gl.activeTexture(gl.TEXTURE0);
	//绑定纹理对象
	gl.bindTexture(gl.TEXTURE_2D,texture);
	//设置纹理对象参数(此处为缩小处理)
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	//设置纹理图片参数(此处指定为RGB参数)
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
	//将纹理单元索引传递给sampler对象
	gl.uniform1i(sampler,0);
	//绘图
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	//绘制矩形元素（由两个三角形构成）
	gl.drawArrays(gl.TRIANGLE_FAN,0,pointNumber);
}