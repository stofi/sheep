#ifdef LINT
precision mediump float;
#endif

#define M_PI 3.14159265358979323846

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uLensPower;
varying vec2 vUv;

vec2 distort(vec2 p,float BarrelPower){
	
	if(p.x>0.){
		float angle=p.y/p.x;
		float theta=atan(angle);
		float radius=length(p);
		radius=pow(radius,BarrelPower);
		
		p.x=radius*cos(theta);
		p.y=radius*sin(theta);
	}else{
		float angle=p.y/p.x;
		float theta=atan(angle);
		float radius=length(p);
		radius=pow(radius,BarrelPower);
		
		p.y=radius*sin(-theta);
		p.x=radius*cos(theta);
		p.x=-p.x;
	}
	
	return.5*(p+vec2(1.,1.));
}

// lens
void main(void)
{
	vec2 uv=vUv;
	uv=distort((uv-.5),uLensPower);
	uv=(uv-.5)*uLensPower*2.+.5;
	
	vec4 col=texture2D(tDiffuse,uv);
	gl_FragColor=col;
}
