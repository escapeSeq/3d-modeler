import * as THREE from 'three'

export const clayShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      
      // Base clay color
      vec3 baseColor = uColor;
      
      // Fresnel effect for edges
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(viewDirection, normal), 2.0);
      
      // Soft lighting
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float NdotL = max(dot(normal, lightDir), 0.0);
      
      // Ambient occlusion approximation
      float ao = 0.3 + 0.7 * (normal.y * 0.5 + 0.5);
      
      // Combine colors
      vec3 color = baseColor;
      color = mix(color, baseColor * 1.2, NdotL * 0.5);
      color = mix(color, baseColor * 0.8, fresnel * 0.3);
      color *= ao;
      
      // Subtle subsurface scattering
      vec3 subsurface = baseColor * 0.3;
      color += subsurface * (1.0 - NdotL) * 0.5;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  uniforms: {
    uColor: { value: new THREE.Color(0.7, 0.5, 0.4) }, // Clay brown
    uTime: { value: 0.0 },
  },
}

