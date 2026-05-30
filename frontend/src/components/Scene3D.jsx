import React, { Suspense, useRef, useEffect } from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ClayModel from './ClayModel'

export default function Scene3D({
  sculptMode,
  brushSize,
  brushStrength,
  autoRotate,
  rotationSpeed,
}) {
  const controlsRef = useRef()
  const clayModelRef = useRef()
  const { gl, camera } = useThree()

  // Initialize camera and controls to look at the center
  useEffect(() => {
    if (controlsRef.current && clayModelRef.current) {
      // Get the center of the clay model
      const center = clayModelRef.current.getCenter()
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }, [])

  // Handle ctrl+click for rotation
  useEffect(() => {
    const canvas = gl.domElement
    const handleMouseDown = (e) => {
      if (e.ctrlKey && e.button === 0) {
        // Temporarily enable left mouse for rotation when ctrl is held
        if (controlsRef.current) {
          controlsRef.current.mouseButtons.LEFT = 2 // Set to rotate
          controlsRef.current.enableRotate = true
        }
      }
    }

    const handleMouseUp = () => {
      // Disable left mouse for rotation when released
      if (controlsRef.current) {
        controlsRef.current.mouseButtons.LEFT = 0
        controlsRef.current.enableRotate = false
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [gl])

  // Force auto-rotate to continue and maintain center target
  useFrame(() => {
    if (controlsRef.current && clayModelRef.current) {
      // Get the current center of the clay model (in case it changes)
      const center = clayModelRef.current.getCenter()
      controlsRef.current.target.copy(center)
      
      if (autoRotate) {
        // Continuously re-enable auto-rotate to prevent it from stopping
        controlsRef.current.autoRotate = true
        controlsRef.current.autoRotateSpeed = rotationSpeed
        // Prevent manual rotation from stopping auto-rotate
        controlsRef.current.autoRotateOnInteraction = true
      }
      
      // Update controls to apply target changes
      controlsRef.current.update()
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Environment for better lighting */}
      <Environment preset="sunset" />

      {/* Camera Controls - target the center of the clay model */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        autoRotate={autoRotate}
        autoRotateSpeed={rotationSpeed}
        // Keep auto-rotate enabled even when interacting
        autoRotateOnInteraction={true}
        // Target will be set dynamically to the clay model center
        mouseButtons={{
          LEFT: 0, // Disable left mouse (we use it for sculpting, or ctrl+click for rotation)
          MIDDLE: 1, // Middle mouse for pan
          RIGHT: 0, // Disable right mouse
        }}
        touches={{
          ONE: 0, // Disable touch rotation
          TWO: 1, // Two-finger pan
        }}
      />

      {/* 3D Model */}
      <Suspense fallback={null}>
        <ClayModel
          ref={clayModelRef}
          sculptMode={sculptMode}
          brushSize={brushSize}
          brushStrength={brushStrength}
        />
      </Suspense>
    </>
  )
}
