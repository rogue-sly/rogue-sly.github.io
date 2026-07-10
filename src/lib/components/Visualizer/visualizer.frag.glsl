precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform bool uShowGrid;
uniform bool uShowSun;
uniform float uGridSpeed;

// Colors sourced from CSS variables each frame
uniform vec3 uBgColor;     // --bg-primary-dark
uniform vec3 uAccentBg;    // --bg-accent  (dark red grid / sun top)
uniform vec3 uAccentFg;    // --fg-accent  (muted red grid lines)
uniform vec3 uFgPrimary;   // --fg-primary (sun glow)

void main() {
    // uv: (0,0) = top-left, (1,1) = bottom-right  (flipped Y from gl_FragCoord)
    vec2 uv = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution;

    float horizonY = 0.6;
    float centerX = 0.5;

    // Start with background colour
    vec3 color = uBgColor;
    float alpha = 1.0;

    // ------------------------------------------------------------------------
    // 1. Retro perspective grid
    // ------------------------------------------------------------------------
    if (uShowGrid) {
        // -- Vertical fan lines --
        if (uv.y > horizonY) {
            float t = (uv.y - horizonY) / (1.0 - horizonY);

            float spreadBottom = 0.1;
            float spreadHorizon = 10.0 / uResolution.x;

            float spread = mix(spreadHorizon, spreadBottom, t);
            float xRel = (uv.x - centerX) / spread;

            float nearest = abs(xRel - floor(xRel + 0.5));
            float lineHalfW = 0.5 / (spread * uResolution.x);

            float gridFade = t;

            if (nearest < lineHalfW) {
                float g = mix(0.0, 0.8, gridFade);
                color = mix(color, uAccentBg, g);
            }

            // -- Horizontal moving lines --
            float bestOpacity = 0.0;
            for (int i = 0; i < 20; i++) {
                float z = (float(i) + mod(uTime * uGridSpeed, 1.0)) * 50.0;
                float yH = horizonY + (1000.0 / (1000.0 - z)) * 0.1;

                if (yH > 1.0 || yH < horizonY) continue;

                float lineOpacity = max(0.0, (yH - horizonY) / (1.0 - horizonY)) * 0.5;
                float lineHalfH = 0.5 / uResolution.y;

                if (abs(uv.y - yH) < lineHalfH) {
                    bestOpacity = max(bestOpacity, lineOpacity);
                }
            }
            if (bestOpacity > 0.0) {
                color = mix(color, uAccentFg, bestOpacity);
            }
        }
    }

    // ------------------------------------------------------------------------
    // 2. Retro gradient sun
    // ------------------------------------------------------------------------
    if (uShowSun) {
        float sunRadiusPx = min(uResolution.x, uResolution.y) * 0.15;
        float sunRadiusY = sunRadiusPx / uResolution.y;

        vec2 sunCenterUV = vec2(centerX, horizonY - sunRadiusY * 0.8);

        vec2 sunCenterPx = vec2(sunCenterUV.x * uResolution.x, (1.0 - sunCenterUV.y) * uResolution.y);
        float distSunPx = length(gl_FragCoord.xy - sunCenterPx);

        float sunAlpha = 1.0 - smoothstep(sunRadiusPx - 1.5, sunRadiusPx + 1.5, distSunPx);

        if (sunAlpha > 0.0) {
            float gradT = (uv.y - (sunCenterUV.y - sunRadiusY)) / (sunRadiusY * 2.0);
            gradT = clamp(gradT, 0.0, 1.0);
            vec3 sunColor = mix(uAccentBg, uFgPrimary, gradT);

            float slatAlpha = 0.0;
            for (int i = 0; i < 5; i++) {
                float fi = float(i);
                float slatTop = horizonY - sunRadiusY * 0.6 + fi * sunRadiusY * 0.15;
                float slatBot = slatTop + sunRadiusY * 0.05 * (fi + 1.0);
                float fadeH = 0.5 / uResolution.y;
                float inside = smoothstep(slatTop - fadeH, slatTop + fadeH, uv.y) *
                    (1.0 - smoothstep(slatBot - fadeH, slatBot + fadeH, uv.y));
                slatAlpha = max(slatAlpha, inside);
            }
            sunColor = mix(sunColor, uBgColor, slatAlpha);

            color = mix(color, sunColor, sunAlpha);
        }
    }

    gl_FragColor = vec4(color, alpha);
}
