#define M_PI 3.14159265358979323846

varying vec2 vUv;

void main(){
	vUv=uv;
	gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
