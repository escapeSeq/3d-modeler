import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene3D from './components/Scene3D'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  const [sculptMode, setSculptMode] = useState('add') // 'add', 'subtract', 'smooth'
  const [brushSize, setBrushSize] = useState(0.3)
  const [brushStrength, setBrushStrength] = useState(0.1)
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(1.0)

  return (
    <div className="app">
      <Toolbar
        sculptMode={sculptMode}
        setSculptMode={setSculptMode}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushStrength={brushStrength}
        setBrushStrength={setBrushStrength}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
      />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene3D
          sculptMode={sculptMode}
          brushSize={brushSize}
          brushStrength={brushStrength}
          autoRotate={autoRotate}
          rotationSpeed={rotationSpeed}
        />
      </Canvas>
    </div>
  )
}

export default App
