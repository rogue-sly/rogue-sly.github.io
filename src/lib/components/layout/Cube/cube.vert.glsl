attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;

uniform mat4 uMvp;
uniform mat3 uNormalMatrix;

varying vec3 vColor;

void main() {
    vec3 n = normalize(uNormalMatrix * aNormal);

    // Simple directional lighting so the cube's edges read clearly.
    vec3 lightDir = normalize(vec3(0.5, 0.8, 0.6));
    float diff = max(dot(n, lightDir), 0.0);
    float shade = 0.35 + 0.65 * diff;

    vColor = aColor * shade;

    gl_Position = uMvp * vec4(aPosition, 1.0);
}
