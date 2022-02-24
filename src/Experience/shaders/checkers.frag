#ifdef LINT
precision mediump float;
#endif

#define M_PI 3.14159265358979323846

varying vec2 vUv;
varying float vFogDepth;
// fogColor
// fogNear
// fogFar

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

// lens
void main(void)
{
  gl_FragColor=vec4(1.,1.,1.,1.);
  
  vec2 uv=vUv;
  vec2 newUv=vUv*40.;
  vec3 color=vec3(0.);
  // checker pattern
  float x=floor(newUv.x);
  float y=floor(newUv.y);
  color.x=mod(x+y,2.)*.5+.5;
  color.y=mod(x-y,2.)*.5+.5;
  color.z=mod(x+y,2.)*.5+.5;
  color*=.25;
  color+=.7;
  gl_FragColor.rgb=color;
  
  vec4 fog=vec4(0.);
  float fogFactor=smoothstep(fogNear,fogFar,vFogDepth);
  fog.rgb=mix(fogColor,vec3(1.),fogFactor);
  fog.a=1.;
  gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,fogFactor);
  
}
