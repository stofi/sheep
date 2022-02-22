varying vec4 vColor;
varying float vMask;


void main() {


	gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 0.0), vColor, vMask);
}