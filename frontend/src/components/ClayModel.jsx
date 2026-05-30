import React, { useRef, useMemo, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clayShader } from '../shaders/clayShader'
import { deformGeometry } from '../utils/geometryUtils'
import { getNormalizedMousePosition, createRaycaster } from '../utils/mouseUtils'

const ClayModel = forwardRef(function ClayModel({ sculptMode, brushSize, brushStrength }, ref) {
  const meshRef = useRef()
  const materialRef = useRef()
  const { camera, gl } = useThree()
  const lastMousePosRef = useRef(null)
  const currentModeRef = useRef(sculptMode)
  const frameCountRef = useRef(0)
  const isMouseDownRef = useRef(false)
  const mouseButtonStateRef = useRef(0) // Track actual mouse button state
  const lastSculptTimeRef = useRef(0) // Track last sculpt time to prevent double sculpting
  const sculptedThisFrameRef = useRef(false) // Flag to prevent sculpting multiple times per frame

  // Expose mesh ref to parent
  useImperativeHandle(ref, () => ({
    getMesh: () => meshRef.current,
    getCenter: () => {
      if (meshRef.current) {
        const box = new THREE.Box3().setFromObject(meshRef.current)
        return box.getCenter(new THREE.Vector3())
      }
      return new THREE.Vector3(0, 0, 0)
    }
  }))

  // Create initial geometry (sphere)
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(1, 64, 64)
  }, [])

  // Create material
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      ...clayShader,
      side: THREE.DoubleSide,
    })
    materialRef.current = mat
    return mat
  }, [])

  // Update current mode when sculptMode prop changes
  useEffect(() => {
    currentModeRef.current = sculptMode
  }, [sculptMode])

  // Sculpt at a specific mouse position
  const performSculpt = useCallback((mouseX, mouseY, mode, currentCamera, currentTime) => {
    if (!meshRef.current) return

    // Prevent sculpting multiple times in the same frame (within 16ms, roughly one frame at 60fps)
    const timeSinceLastSculpt = currentTime - lastSculptTimeRef.current
    if (timeSinceLastSculpt < 16 && sculptedThisFrameRef.current) {
      return
    }

    const mousePos = { x: mouseX, y: mouseY }
    // Use the current camera passed in (or fallback to the one from useThree)
    const cam = currentCamera || camera
    const raycaster = createRaycaster(mousePos, cam)

    // Perform raycast - this works even as the model rotates
    // The raycast uses the current camera position and the model's current rotation
    const intersects = raycaster.intersectObject(meshRef.current)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      const point = intersection.point
      const face = intersection.face

      // Get face normal
      const normal = new THREE.Vector3()
      if (face.normal) {
        normal.copy(face.normal)
      } else {
        // Calculate normal from face vertices
        const geo = meshRef.current.geometry
        const positions = geo.attributes.position
        const a = new THREE.Vector3().fromBufferAttribute(positions, face.a)
        const b = new THREE.Vector3().fromBufferAttribute(positions, face.b)
        const c = new THREE.Vector3().fromBufferAttribute(positions, face.c)
        normal.subVectors(c, b).cross(normal.subVectors(a, b)).normalize()
      }

      // Transform point to local space
      const localPoint = point.clone()
      meshRef.current.worldToLocal(localPoint)

      // Normal is already in local space (from face)
      // Transform it to match the mesh's orientation
      const localNormal = normal.clone()
      localNormal.normalize()

      // Get geometry from mesh
      const geo = meshRef.current.geometry

      // Use brush strength directly (removed 100x reduction)
      // The strength reduction was making changes too small to see
      const actualStrength = brushStrength / 10

      // Deform geometry
      deformGeometry(
        geo,
        localPoint,
        localNormal,
        brushSize,
        actualStrength,
        mode
      )

      // Force geometry update
      geo.attributes.position.needsUpdate = true
      geo.computeVertexNormals()
      if (geo.attributes.normal) {
        geo.attributes.normal.needsUpdate = true
      }
      
      // Force mesh to update
      if (meshRef.current) {
        meshRef.current.updateMatrix()
      }

      // Mark that we've sculpted this frame
      lastSculptTimeRef.current = currentTime
      sculptedThisFrameRef.current = true
    }
  }, [camera, brushSize, brushStrength])

  // Track global mouse state to verify button is actually down
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      // Update the actual mouse button state
      mouseButtonStateRef.current = e.buttons
    }

    const handleGlobalMouseDown = (e) => {
      if (e.button === 0) {
        mouseButtonStateRef.current = e.buttons
      }
    }

    const handleGlobalMouseUp = (e) => {
      if (e.button === 0) {
        mouseButtonStateRef.current = 0
        isMouseDownRef.current = false
        lastMousePosRef.current = null
        frameCountRef.current = 0
        lastSculptTimeRef.current = 0
        sculptedThisFrameRef.current = false
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove, true)
    window.addEventListener('mousedown', handleGlobalMouseDown, true)
    window.addEventListener('mouseup', handleGlobalMouseUp, true)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove, true)
      window.removeEventListener('mousedown', handleGlobalMouseDown, true)
      window.removeEventListener('mouseup', handleGlobalMouseUp, true)
    }
  }, [])

  // Continuously sculpt while mouse is held down (10x slower)
  useFrame((state, delta) => {
    // Reset the frame flag at the start of each frame
    sculptedThisFrameRef.current = false

    // Get fresh camera reference from the frame context
    const currentCamera = state.camera
    const currentTime = state.clock.elapsedTime * 1000 // Convert to milliseconds

    // Verify mouse button is actually still down (check actual browser state)
    const mouseButtonDown = (mouseButtonStateRef.current & 1) === 1
    const shouldContinue = mouseButtonDown && isMouseDownRef.current && lastMousePosRef.current

    // Continue sculpting if mouse is down and we have a position
    if (shouldContinue) {
      frameCountRef.current++
      // Only sculpt every 10th frame
      if (frameCountRef.current >= 10) {
        frameCountRef.current = 0
        // Raycast from current camera to current mouse position
        // As the model rotates, this will hit different parts of the model
        performSculpt(
          lastMousePosRef.current.x, 
          lastMousePosRef.current.y, 
          currentModeRef.current,
          currentCamera,
          currentTime
        )
      }
    } else {
      frameCountRef.current = 0
      // If mouse button is not actually down, clear our state
      if (!mouseButtonDown) {
        isMouseDownRef.current = false
        lastMousePosRef.current = null
        lastSculptTimeRef.current = 0
        sculptedThisFrameRef.current = false
      }
    }

    // Animate shader time
    if (materialRef.current?.uniforms) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  // Handle mouse interaction
  const handlePointerMove = useCallback((event) => {
    if (!meshRef.current) return

    // Don't sculpt if right-clicking (button 2) or middle-clicking (button 1/4)
    if (event.buttons === 2 || event.buttons === 4) {
      isMouseDownRef.current = false
      return
    }

    // Don't sculpt if ctrl is held (used for rotation)
    if (event.ctrlKey) {
      isMouseDownRef.current = false
      return
    }

    // Only sculpt with left mouse button (button 1)
    if (event.buttons !== 1) {
      isMouseDownRef.current = false
      return
    }

    // Determine sculpt mode based on modifier keys
    let mode = sculptMode
    if (event.shiftKey) {
      mode = 'subtract'
    } else if (event.altKey) {
      mode = 'smooth'
    }
    currentModeRef.current = mode

    const mousePos = getNormalizedMousePosition(event, gl.domElement)
    lastMousePosRef.current = mousePos
    isMouseDownRef.current = true
    mouseButtonStateRef.current = event.buttons
    frameCountRef.current = 0 // Reset frame counter on new mouse position

    // Perform sculpt immediately on mouse move (not throttled)
    // Use performance.now() for consistent timing
    performSculpt(mousePos.x, mousePos.y, mode, camera, performance.now())
  }, [gl, sculptMode, performSculpt, camera])

  // Handle mouse down
  const handlePointerDown = useCallback((event) => {
    // Don't sculpt if right-clicking, middle-clicking, or ctrl+click
    if (event.button === 2 || event.button === 1 || event.ctrlKey) {
      return
    }
    
    // Determine sculpt mode based on modifier keys
    let mode = sculptMode
    if (event.shiftKey) {
      mode = 'subtract'
    } else if (event.altKey) {
      mode = 'smooth'
    }
    currentModeRef.current = mode

    const mousePos = getNormalizedMousePosition(event, gl.domElement)
    lastMousePosRef.current = mousePos
    isMouseDownRef.current = true
    mouseButtonStateRef.current = event.buttons
    frameCountRef.current = 0
    lastSculptTimeRef.current = 0
    sculptedThisFrameRef.current = false

    // Perform sculpt immediately on mouse down
    performSculpt(mousePos.x, mousePos.y, mode, camera, performance.now())
  }, [gl, sculptMode, performSculpt, camera])

  // Handle mouse up
  const handlePointerUp = useCallback(() => {
    isMouseDownRef.current = false
    lastMousePosRef.current = null
    mouseButtonStateRef.current = 0
    frameCountRef.current = 0
    lastSculptTimeRef.current = 0
    sculptedThisFrameRef.current = false
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={(e) => {
        // Only clear if mouse button is actually released
        if ((e.buttons & 1) === 0) {
          handlePointerUp()
        }
      }}
    />
  )
})

ClayModel.displayName = 'ClayModel'

export default ClayModel
