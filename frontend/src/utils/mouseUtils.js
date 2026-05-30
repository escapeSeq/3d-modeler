import * as THREE from 'three'

/**
 * Convert mouse coordinates to normalized device coordinates
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} element - Canvas element
 * @returns {Object} Normalized coordinates {x, y}
 */
export function getNormalizedMousePosition(event, element) {
  const rect = element.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
  }
}

/**
 * Create a raycaster from mouse position
 * @param {Object} mousePos - Normalized mouse position {x, y}
 * @param {THREE.Camera} camera - Camera object
 * @returns {THREE.Raycaster} Configured raycaster
 */
export function createRaycaster(mousePos, camera) {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(mousePos.x, mousePos.y), camera)
  return raycaster
}

