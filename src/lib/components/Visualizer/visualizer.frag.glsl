precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform int uBarCount;
uniform bool uShowGrid;
uniform bool uShowReflections;
uniform bool uShowSun;
uniform float uBarHeightScale;
uniform float uGridSpeed;

// Colors sourced from CSS variables each frame
uniform vec3 uBgColor; // --bg-primary-dark
uniform vec3 uAccentBg; // --bg-accent  (dark red grid / sun top)
uniform vec3 uAccentFg; // --fg-accent  (muted red grid lines)
uniform vec3 uFgPrimary; // --fg-primary (bars / sun glow)

// 1-D frequency texture  (width = bufferLength, height = 1, LUMINANCE)
uniform sampler2D uFreqTex;
uniform int uBufLen; // frequencyBinCount

// -------------------------------------------------------------------------- //
// Helpers
// -------------------------------------------------------------------------- //

// Sample the frequency texture for bar index i (0-based).
// Returns 0-1 normalised amplitude for that bar.
float freqBar(int i) {
    // Map bar index into lower half of frequency buffer
    float dataIndex = float(i) * (float(uBufLen) / 2.0) / float(uBarCount);
    float tx = (dataIndex + 0.5) / float(uBufLen);
    return texture2D(uFreqTex, vec2(tx, 0.5)).r;
}

// -------------------------------------------------------------------------- //
// Main
// -------------------------------------------------------------------------- //

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
        // Lines fan out from (centerX, horizonY) to the bottom edge.
        // A pixel is "on a line" if its x position, projected back to
        // the horizon, is within half a pixel of one of the N lines.
        if (uv.y > horizonY) {
            float t = (uv.y - horizonY) / (1.0 - horizonY); // 0 at horizon, 1 at bottom

            // Project uv.x back to the horizon line.
            // At the horizon lines are spaced 10px apart (original: i*10).
            // At the bottom they are spaced width/10 apart (xBottom = centerX + i*width/10).
            float spreadBottom = 0.1; // width/10 normalised
            float spreadHorizon = 10.0 / uResolution.x;

            float spread = mix(spreadHorizon, spreadBottom, t);
            float xRel = (uv.x - centerX) / spread;

            // Distance to nearest integer grid line
            float nearest = abs(xRel - floor(xRel + 0.5));
            float lineHalfW = 0.5 / (spread * uResolution.x); // 0.5px in normalised units

            // Fade: 0 at horizon, 1 at bottom
            float gridFade = t;

            if (nearest < lineHalfW) {
                float g = mix(0.0, 0.8, gridFade);
                color = mix(color, uAccentBg, g);
            }

            // -- Horizontal moving lines --
            // Exponential spacing, animated by uTime (speed controlled by uGridSpeed)
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
        // Pixel radius matches original: min(width, height) * 0.15
        float sunRadiusPx = min(uResolution.x, uResolution.y) * 0.15;
        // UV radius (Y spans 0→1 over height px)
        float sunRadiusY = sunRadiusPx / uResolution.y;

        // Sun centre in UV space (Y-down)
        vec2 sunCenterUV = vec2(centerX, horizonY - sunRadiusY * 0.8);

        // Circle test in pixel space to avoid aspect-ratio distortion.
        // gl_FragCoord is Y-up (origin bottom-left), so flip sunCenterUV.y.
        vec2 sunCenterPx = vec2(sunCenterUV.x * uResolution.x, (1.0 - sunCenterUV.y) * uResolution.y);
        float distSunPx = length(gl_FragCoord.xy - sunCenterPx);

        // Soft 1.5px feather on the circle edge
        float sunAlpha = 1.0 - smoothstep(sunRadiusPx - 1.5, sunRadiusPx + 1.5, distSunPx);

        if (sunAlpha > 0.0) {
            // Gradient top→bottom: uAccentBg (dark red) → uFgPrimary (light glow)
            // Range spans the full circle diameter in UV Y
            float gradT = (uv.y - (sunCenterUV.y - sunRadiusY)) / (sunRadiusY * 2.0);
            gradT = clamp(gradT, 0.0, 1.0);
            vec3 sunColor = mix(uAccentBg, uFgPrimary, gradT);

            // Sun slats
            // Exact transcription of original canvas logic (all values in UV Y, Y-down):
            //   slatY = horizonY - sunRadius*0.8 + sunRadius*0.2 + i*sunRadius*0.15
            //         = horizonY - sunRadius*0.6 + i*sunRadius*0.15
            //   slatH = sunRadius * 0.05 * (i + 1)
            float slatAlpha = 0.0;
            for (int i = 0; i < 5; i++) {
                float fi = float(i);
                float slatTop = horizonY - sunRadiusY * 0.6 + fi * sunRadiusY * 0.15;
                float slatBot = slatTop + sunRadiusY * 0.05 * (fi + 1.0);
                // 0.5px soft edge on each slat boundary
                float fadeH = 0.5 / uResolution.y;
                float inside = smoothstep(slatTop - fadeH, slatTop + fadeH, uv.y) *
                    (1.0 - smoothstep(slatBot - fadeH, slatBot + fadeH, uv.y));
                slatAlpha = max(slatAlpha, inside);
            }
            sunColor = mix(sunColor, uBgColor, slatAlpha);

            color = mix(color, sunColor, sunAlpha);
        }
    }

    // ------------------------------------------------------------------------
    // 3. Spectrum bars (mirrored) + reflections
    // ------------------------------------------------------------------------
    float barWidth = 1.0 / (float(uBarCount) * 2.0); // normalised bar width
    float barGap = 2.0 / uResolution.x; // 2px gap normalised

    // Which bar column does this pixel fall in?
    float xRel = uv.x - centerX; // negative = left, positive = right
    float xAbs = abs(xRel);
    int barIdx = int(xAbs / barWidth);

    if (barIdx < uBarCount) {
        float amp = freqBar(barIdx);
        float barHeight = amp * uBarHeightScale;

        // Bar inner width (2px gap subtracted)
        float barLeft = centerX + float(barIdx) * barWidth;
        float barRight = barLeft + barWidth - barGap;
        float mirBarL = centerX - (float(barIdx) + 1.0) * barWidth;
        float mirBarR = mirBarL + barWidth - barGap;

        bool inRightBar = (uv.x >= barLeft && uv.x < barRight);
        bool inLeftBar = (uv.x >= mirBarL && uv.x < mirBarR);

        if (inRightBar || inLeftBar) {
            // Main bar (above horizon)
            if (uv.y >= horizonY - barHeight && uv.y < horizonY) {
                color = mix(color, uFgPrimary, 0.5);
            }

            // Reflection (below horizon, half height, lower opacity)
            if (uShowReflections) {
                float reflHeight = barHeight * 0.5;
                if (uv.y >= horizonY && uv.y < horizonY + reflHeight) {
                    // rgba(205,205,205, 0.20)
                    vec3 reflColor = vec3(205.0 / 255.0, 205.0 / 255.0, 205.0 / 255.0);
                    color = mix(color, reflColor, 0.20);
                }
            }
        }
    }

    gl_FragColor = vec4(color, alpha);
}
