import * as THREE from "three";

// First, let's create a reusable lerp utility
export const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

// Vector3 lerp utility
export const lerpV3 = (current: THREE.Vector3, target: THREE.Vector3, factor: number) => {
    current.x = lerp(current.x, target.x, factor);
    current.y = lerp(current.y, target.y, factor);
    current.z = lerp(current.z, target.z, factor);
};

// Quaternion slerp utility
export const slerpQ = (current: THREE.Quaternion, target: THREE.Quaternion, factor: number) => {
    current.slerp(target, factor);
}; 