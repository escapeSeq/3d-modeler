import * as THREE from 'three'

/**
 * Deform geometry at a specific point
 * @param {THREE.BufferGeometry} geometry - The geometry to deform
 * @param {THREE.Vector3} point - The point of impact in world space
 * @param {THREE.Vector3} normal - The normal at the impact point
 * @param {number} radius - Brush radius
 * @param {number} strength - Deformation strength
 * @param {string} mode - 'add', 'subtract', or 'smooth'
 */
export function deformGeometry(geometry, point, normal, radius, strength, mode) {
  const positions = geometry.attributes.position
  if (!positions) return
  
  const vertices = positions.array
  const vertexCount = vertices.length / 3

  // Normalize the normal vector
  const normalizedNormal = normal.clone().normalize()

  let hasChanges = false

  for (let i = 0; i < vertexCount; i++) {
    const x = vertices[i * 3]
    const y = vertices[i * 3 + 1]
    const z = vertices[i * 3 + 2]
    const vertex = new THREE.Vector3(x, y, z)

    // Calculate distance from vertex to impact point
    const distance = vertex.distanceTo(point)

    if (distance < radius) {
      // Calculate influence (falloff) with smoothstep
      const influence = 1 - distance / radius
      const smoothInfluence = influence * influence * (3 - 2 * influence)

      // Calculate deformation direction
      let deformation = new THREE.Vector3()

      if (mode === 'add') {
        // Push outward along normal
        deformation = normalizedNormal.clone().multiplyScalar(strength * smoothInfluence)
      } else if (mode === 'subtract') {
        // Push inward opposite to normal
        deformation = normalizedNormal.clone().multiplyScalar(-strength * smoothInfluence)
      } else if (mode === 'smooth') {
        // Smooth by moving toward the impact point (averaging effect)
        const toPoint = point.clone().sub(vertex)
        const length = toPoint.length()
        if (length > 0) {
          deformation = toPoint.normalize().multiplyScalar(strength * smoothInfluence * 0.2)
        }
      }

      // Apply deformation
      vertices[i * 3] += deformation.x
      vertices[i * 3 + 1] += deformation.y
      vertices[i * 3 + 2] += deformation.z
      hasChanges = true
    }
  }

  if (hasChanges) {
    // Mark positions as needing update
    positions.needsUpdate = true

    // Recalculate normals
    geometry.computeVertexNormals()
    
    // Mark normals as needing update
    if (geometry.attributes.normal) {
      geometry.attributes.normal.needsUpdate = true
    }
  }
}
