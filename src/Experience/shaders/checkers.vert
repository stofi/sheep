#define M_PI 3.14159265358979323846

varying vec2 vUv;
varying float vFogDepth;

void main(){
  
  vec4 modelPosition=modelMatrix*vec4(position,1.);
  vec4 viewPosition=viewMatrix*modelPosition;
  gl_Position=projectionMatrix*viewPosition;
  
  vUv=uv;
  vFogDepth=-viewPosition.z;
}
