import * as THREE from "three";

export interface PS1MaterialUniforms {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uGlitchIntensity: { value: number };
  uScrollProgress: { value: number };
}

const vertexShader = `
    uniform float uTime;
    uniform float uGlitchIntensity;
    uniform float uScrollProgress;
    uniform vec2 uResolution;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);

        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vViewPosition = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uGlitchIntensity;
    uniform float uScrollProgress;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float noise(vec3 P) {
        vec3 i0 = mod289(floor(P));
        vec3 i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P);
        vec3 f1 = f0 - vec3(1.0);
        vec3 f = fade(f0);
        
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x);
        vec4 iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz;
        vec4 iz1 = i1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, f0);
        float n100 = dot(g100, vec3(f1.x, f0.yz));
        float n010 = dot(g010, vec3(f0.x, f1.y, f0.z));
        float n110 = dot(g110, vec3(f1.xy, f0.z));
        float n001 = dot(g001, vec3(f0.xy, f1.z));
        float n101 = dot(g101, vec3(f1.x, f0.y, f1.z));
        float n011 = dot(g011, vec3(f0.x, f1.yz));
        float n111 = dot(g111, f1);

        vec3 fade_xyz = fade(f0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
    }

    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.0;
        for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
        // Fresnel effect with enhanced edge glow
        vec3 viewDirection = normalize(vViewPosition);
        float fresnel = pow(1.0 - dot(vNormal, viewDirection), 3.0);
        
        // Fluid motion using multiple noise layers
        vec3 noisePos = vPosition * 2.0 + vec3(uTime * 0.1);
        float noise1 = fbm(noisePos);
        float noise2 = fbm(noisePos * 1.5 - uTime * 0.15);
        float noise3 = fbm(noisePos * 0.5 + uTime * 0.05);
        
        // Create fluid-like motion
        float fluidMotion = noise1 * noise2 * noise3;
        
        // Swirling effect
        float swirl = sin(vPosition.y * 3.0 + noise1 * 5.0 + uTime * 0.2) * 
                     cos(vPosition.x * 2.0 + noise2 * 4.0 - uTime * 0.15);
        
        // Color palette for iridescent effect
        vec3 deepBlue = vec3(0.0, 0.1, 0.3);
        vec3 brightBlue = vec3(0.2, 0.5, 1.0);
        vec3 highlight = vec3(0.7, 0.9, 1.0);
        vec3 accent = vec3(0.4, 0.8, 1.0);
        
        // Mix colors based on noise and swirl
        vec3 baseColor = mix(deepBlue, brightBlue, noise1 * 0.8 + 0.2);
        baseColor = mix(baseColor, accent, swirl * 0.5 + 0.5);
        
        // Add iridescent highlights
        float iridescence = sin(noise2 * 10.0 + uTime) * 0.5 + 0.5;
        baseColor = mix(baseColor, highlight, iridescence * fresnel);
        
        // Add flowing energy effect
        float energy = sin(noise3 * 8.0 - uTime * 2.0) * 0.5 + 0.5;
        baseColor += highlight * energy * 0.2;
        
        // Edge highlighting
        float edge = pow(1.0 - dot(vNormal, viewDirection), 4.0);
        baseColor += highlight * edge * 0.5;
        
        // Add subtle color variations
        float colorShift = sin(fluidMotion * 4.0 - uTime) * 0.5 + 0.5;
        baseColor = mix(baseColor, accent, colorShift * 0.3);
        
        // Enhance brightness at the center
        float center = 1.0 - length(vPosition.xy);
        baseColor += highlight * center * 0.2;
        
        // Add scroll-based effects
        float scrollEffect = uScrollProgress * 2.0;
        baseColor += accent * scrollEffect * 0.3;
        
        // Final color adjustments
        vec3 finalColor = baseColor;
        finalColor *= 1.0 + fresnel * 0.5;  // Enhance edges
        finalColor += highlight * fluidMotion * 0.1;  // Add subtle flowing highlights
        
        // Alpha
        float alpha = 0.7 + fresnel * 0.2 + fluidMotion * 0.1;
        alpha = mix(alpha, 1.0, center * 0.5);  // More solid at center
        
        gl_FragColor = vec4(finalColor, alpha);
    }
`;

export class PS1Material extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uGlitchIntensity: { value: 0.5 },
        uScrollProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
}
export type PS1MaterialType = PS1Material;

