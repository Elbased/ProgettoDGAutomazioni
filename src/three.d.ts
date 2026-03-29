declare module 'three' {
  export const Scene: any;
  export const PerspectiveCamera: any;
  export const WebGLRenderer: any;
  export const Group: any;
  export const Mesh: any;
  export const Points: any;
  export const PointLight: any;
  export const AmbientLight: any;
  export const DirectionalLight: any;
  export const Color: any;
  export const Fog: any;
  export const PlaneGeometry: any;
  export const BoxGeometry: any;
  export const CylinderGeometry: any;
  export const SphereGeometry: any;
  export const BufferGeometry: any;
  export const BufferAttribute: any;
  export const Float32BufferAttribute: any;
  export const MeshStandardMaterial: any;
  export const MeshBasicMaterial: any;
  export const PointsMaterial: any;
  export const LineBasicMaterial: any;
  export const CanvasTexture: any;
  export const TextureLoader: any;
  export const GridHelper: any;
  export const Vector3: any;
  export const DoubleSide: any;
  export const AdditiveBlending: any;
  export const PCFSoftShadowMap: any;
  export const ACESFilmicToneMapping: any;
  const THREE: any;
  export default THREE;
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    constructor(camera: any, domElement: any);
    enableDamping: boolean;
    dampingFactor: number;
    target: { set: (x: number, y: number, z: number) => void };
    maxPolarAngle: number;
    minDistance: number;
    maxDistance: number;
    update(): void;
  }
}
