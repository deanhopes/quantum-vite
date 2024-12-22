import * as THREE from "three";
import { extend, Object3DNode } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// Define proper types for the shader uniforms
interface PS1MaterialUniforms {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uGlitchIntensity: { value: number };
  uScrollProgress: { value: number };
}

// Create the shader material with proper typing
const PS1MaterialImpl = shaderMaterial<PS1MaterialUniforms>(
  {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(320, 240) },
    uGlitchIntensity: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
  },
  // Vertex shader
  /* glsl */ `
    uniform float uTime;
    uniform float uGlitchIntensity;
    uniform float uScrollProgress;
    uniform vec2 uResolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    vec4 getPS1Snap(vec4 vertex) {
      vec4 snapped = vertex;
      snapped.xyz = vertex.xyz / vertex.w;
      snapped.xyz = floor(snapped.xyz * 32.0) / 32.0;
      snapped.xyz *= vertex.w;
      return snapped;
    }

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);

      vec3 pos = position;
      float glitchOffset = sin(uTime * 10.0 + position.y * 20.0) * uGlitchIntensity;
      pos.x += glitchOffset * (1.0 + uScrollProgress);

      vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 ps1Position = getPS1Snap(viewPosition);
      
      gl_Position = projectionMatrix * ps1Position;
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uGlitchIntensity;
    uniform float uScrollProgress;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float scanline(vec2 uv) {
      return sin(uv.y * 400.0) * 0.05;
    }

    void main() {
      vec2 uv = vUv;
      vec2 crtUv = uv;
      float distortAmount = sin(uTime * 0.2) * 0.0005 + 0.0005;
      crtUv.x += sin(uv.y * 10.0 + uTime) * distortAmount;
      
      float glitchNoise = random(vec2(floor(uTime * 5.0), floor(vUv.y * 5.0)));
      vec2 glitchOffset = vec2(
        glitchNoise * 0.01 * uGlitchIntensity * uScrollProgress,
        0.0
      );
      uv += glitchOffset;

      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      vec3 baseColor = mix(
        vec3(0.2, 0.4, 0.8),
        vec3(0.8, 0.9, 1.0),
        0.5 + 0.5 * sin(vPosition.y * 0.5 + uTime * 0.2)
      );
      
      vec3 color = baseColor * diff;
      color = floor(color * 16.0) / 16.0;
      color += vec3(scanline(crtUv));

      float vignette = length(vec2(0.5) - uv);
      color *= 1.0 - vignette * 0.3;

      float bleed = sin(uTime) * 0.005;
      color.r += bleed;
      color.b -= bleed;

      float noise = random(uv + uTime * 0.05) * 0.02;
      color += noise;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Create the material type
export type PS1MaterialType = THREE.ShaderMaterial & {
  uniforms: PS1MaterialUniforms;
};

// Create and extend the material
export const PS1Material = PS1MaterialImpl as new () => PS1MaterialType;
extend({ PS1Material });

// Add proper type declarations
declare module "@react-three/fiber" {
  interface ThreeElements {
    pS1Material: Object3DNode<PS1MaterialType, typeof PS1Material>;
  }
}
