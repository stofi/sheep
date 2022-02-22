#define M_PI 3.14159265358979323846

uniform float uWidth;
uniform float uHeight;
uniform float uTime;
uniform float uWaveHeight;
uniform float uMaskPower;
uniform float uSpeed;
uniform sampler2D uData;
uniform float uNoiseAudio;
uniform vec2 uTextureScale;

varying vec4 vColor;
varying float vMask;


void main() {
	
	vec4 objectSpace = modelMatrix * vec4( position, 1.0 );

	vec2 snappedUv = floor(uv * vec2( uWidth, uHeight )) / vec2( uWidth, uHeight );
	vec2 snappedUvDiff = (((uv * vec2( uWidth, uHeight )) / vec2( uWidth, uHeight ) - snappedUv) - 0.0) * 1.0; 

	float stripesY = step(0.8, 1.0 - abs(( mod( (uv.y) * uHeight, 1.0 ) * 2.0) - 1.0));


	float noise = cnoise(vec2(uv.x * 7.0, uv.y / uSpeed + uTime ));
	float gradient = pow(sin(uv.x * M_PI), uMaskPower);

	float waves = (noise*gradient + gradient);

	vMask = stripesY;

	float mixX = uv.x * uWidth;
	float floorX = floor(mixX);
	float spread = 0.3;
	float subtractX = (mixX - floorX);
	float x0 = (floorX) / uWidth;
	float x1 = (floorX + 1.0) / uWidth;
	float t0 = texture2D(uData, vec2(abs(x0 - 0.5), snappedUv.y) * uTextureScale).x;
	float t1 = texture2D(uData, vec2(abs(x1 - 0.5), snappedUv.y) * uTextureScale).x;
	float t = mix(t0, t1, subtractX) * 1.5;


	float waves2 = max(0.0,(pow(t,.99)-(gradient*.4))*gradient);


	float wavesMix = mix(waves2, waves, uNoiseAudio);
	vColor = vec4(1.0, 1.0, 1.0, 1.0 );
	// vColor = vec4(vec3(t), 1.0 );

	float elevation = wavesMix / ( 10.0 / uWaveHeight);
	objectSpace.y += elevation;


	vec4 viewSpace = viewMatrix * objectSpace;
	vec4 projectionSpace = projectionMatrix * viewSpace;
	gl_Position = projectionSpace;
}