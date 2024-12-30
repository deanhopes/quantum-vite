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
    varying vec3 vWorldPosition;
    varying float vAtmosphereHeight;

    const float PLANET_RADIUS = 1.0;
    const float ATMOSPHERE_HEIGHT = 0.15;
    const int NUM_STEPS = 16;

    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);

        // Calculate world position for atmospheric scattering
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        // Calculate atmosphere height for scattering
        vAtmosphereHeight = (length(position) - PLANET_RADIUS) / ATMOSPHERE_HEIGHT;

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
    varying vec3 vWorldPosition;
    varying float vAtmosphereHeight;

    const vec3 RAYLEIGH_COEFFS = vec3(5.5e-6, 13.0e-6, 22.4e-6);
    const float MIE_COEFFICIENT = 21e-6;
    const float ATMOSPHERE_DENSITY = 0.75;
    const vec3 PLANET_BASE_COLOR = vec3(0.1, 0.2, 0.4);
    const vec3 ATMOSPHERE_COLOR = vec3(0.4, 0.6, 1.0);
    const float CLOUD_COVERAGE = 0.6;
    const float CLOUD_SPEED = 0.02;
    const int VOLUMETRIC_STEPS = 8;
    const float ENERGY_PULSE_SPEED = 0.5;

    // Advanced noise functions
    float hash(vec3 p) {
        p = fract(p * vec3(443.8975, 397.2973, 491.1871));
        p += dot(p.zxy, p.yxz + 19.19);
        return fract(p.x * p.y * p.z);
    }

    float voronoi(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        float minDist = 1.0;
        
        for(int z = -1; z <= 1; z++) {
            for(int y = -1; y <= 1; y++) {
                for(int x = -1; x <= 1; x++) {
                    vec3 neighbor = vec3(float(x), float(y), float(z));
                    vec3 point = neighbor + hash(i + neighbor) - f;
                    float dist = length(point);
                    minDist = min(minDist, dist);
                }
            }
        }
        return minDist;
    }

    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
            value += amplitude * voronoi(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    // Advanced atmospheric scattering with volumetrics
    vec3 calculateScattering(vec3 viewDir, vec3 lightDir) {
        float cosTheta = dot(viewDir, lightDir);
        
        // Enhanced Rayleigh phase
        float rayleighPhase = 0.75 * (1.0 + cosTheta * cosTheta);
        
        // Advanced Mie phase with back-scattering
        float g = 0.76;
        float g2 = g * g;
        float miePhase = (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5);
        
        vec3 scattering = vec3(0.0);
        float opticalDepth = 0.0;
        
        // Volumetric atmosphere sampling
        for(int i = 0; i < VOLUMETRIC_STEPS; i++) {
            float height = float(i) / float(VOLUMETRIC_STEPS);
            float density = exp(-height * ATMOSPHERE_DENSITY);
            opticalDepth += density;
            
            vec3 rayleighContrib = RAYLEIGH_COEFFS * rayleighPhase * density;
            vec3 mieContrib = vec3(MIE_COEFFICIENT * miePhase * density);
            
            scattering += (rayleighContrib + mieContrib) * exp(-opticalDepth);
        }
        
        // Height-based color variation
        float atmosphereHeight = clamp(vAtmosphereHeight, 0.0, 1.0);
        vec3 atmosphereGradient = mix(
            ATMOSPHERE_COLOR * 1.5,
            ATMOSPHERE_COLOR * 0.5,
            atmosphereHeight
        );
        
        return scattering * atmosphereGradient;
    }

    // Enhanced surface detail with dynamic features
    vec3 calculateSurfaceDetail(vec3 pos) {
        // Dynamic terrain with energy pulses
        float terrain = fbm(pos * 2.0 + vec3(uTime * 0.05));
        float energyPulse = sin(terrain * 10.0 + uTime * ENERGY_PULSE_SPEED) * 0.5 + 0.5;
        
        // Advanced cloud system with multiple layers
        vec2 cloudUV = pos.xy * 0.5 + vec2(uTime * CLOUD_SPEED);
        float baseClouds = voronoi(vec3(cloudUV * 2.0, uTime * 0.1));
        float highClouds = voronoi(vec3(cloudUV * 4.0, -uTime * 0.15));
        float clouds = smoothstep(CLOUD_COVERAGE, CLOUD_COVERAGE + 0.2, 
            mix(baseClouds, highClouds, 0.5));
        
        // Surface features with energy flow
        vec3 surfaceColor = mix(
            PLANET_BASE_COLOR,
            ATMOSPHERE_COLOR,
            terrain * 0.4 + energyPulse * 0.2
        );
        
        // Enhanced cloud rendering
        vec3 cloudColor = mix(
            vec3(0.8, 0.9, 1.0) * (1.0 - energyPulse * 0.3),
            vec3(1.0, 1.0, 1.0) * (1.0 + energyPulse * 0.2),
            clouds
        );
        
        // Dynamic shadow and highlight system
        float shadowIntensity = mix(0.6, 0.8, energyPulse);
        surfaceColor = mix(surfaceColor * shadowIntensity, cloudColor, clouds * 0.7);
        
        // Height-based features
        float height = terrain * 0.5 + 0.5;
        vec3 heightColor = mix(
            PLANET_BASE_COLOR * 0.7,
            ATMOSPHERE_COLOR * 1.2,
            height + energyPulse * 0.2
        );
        
        // Energy flow patterns
        vec3 energyColor = mix(
            vec3(0.3, 0.6, 1.0),
            vec3(0.6, 0.8, 1.0),
            energyPulse
        );
        
        surfaceColor = mix(surfaceColor, heightColor, 0.3);
        surfaceColor += energyColor * energyPulse * 0.2;
        
        return surfaceColor;
    }

    void main() {
        vec3 viewDirection = normalize(vViewPosition);
        vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
        
        // Enhanced normal calculation with dynamic perturbation
        float perturbation = fbm(vPosition * 3.0 + vec3(uTime * 0.1)) * 0.2;
        vec3 normal = normalize(vNormal + perturbation);
        
        // Advanced lighting
        float diffuse = max(dot(normal, lightDirection), 0.0);
        float fresnel = pow(1.0 - dot(normal, viewDirection), 5.0);
        
        // Surface detail with atmospheric interaction
        vec3 surfaceColor = calculateSurfaceDetail(vPosition);
        vec3 scattering = calculateScattering(viewDirection, lightDirection);
        
        // Enhanced final color composition
        vec3 finalColor = surfaceColor * (diffuse * 0.8 + 0.3);
        finalColor += scattering * (1.0 + fresnel * 3.0);
        
        // Advanced rim lighting with atmospheric influence
        float rim = pow(1.0 - dot(normal, viewDirection), 4.0);
        vec3 rimColor = mix(
            ATMOSPHERE_COLOR * 0.5,
            ATMOSPHERE_COLOR * 1.5,
            rim + sin(uTime * 0.5) * 0.2
        );
        finalColor += rimColor * rim * 0.6;
        
        // Dynamic scroll effect
        float scrollEffect = uScrollProgress * 1.5;
        finalColor = mix(
            finalColor,
            finalColor * 1.3 + ATMOSPHERE_COLOR * 0.2,
            scrollEffect
        );
        
        // Atmospheric glow
        float glow = pow(fresnel, 3.0) * (1.0 + sin(uTime * 0.2) * 0.2);
        finalColor += ATMOSPHERE_COLOR * glow * 0.3;
        
        // Enhanced alpha for atmospheric depth
        float alpha = 0.9 + fresnel * 0.1 + glow * 0.1;
        
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
