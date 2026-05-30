import React from 'react'
import './Toolbar.css'

export default function Toolbar({
  sculptMode,
  setSculptMode,
  brushSize,
  setBrushSize,
  brushStrength,
  setBrushStrength,
  autoRotate,
  setAutoRotate,
  rotationSpeed,
  setRotationSpeed,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Sculpt Mode</h3>
        <div className="button-group">
          <button
            className={sculptMode === 'add' ? 'active' : ''}
            onClick={() => setSculptMode('add')}
          >
            Add
          </button>
          <button
            className={sculptMode === 'subtract' ? 'active' : ''}
            onClick={() => setSculptMode('subtract')}
          >
            Subtract
          </button>
          <button
            className={sculptMode === 'smooth' ? 'active' : ''}
            onClick={() => setSculptMode('smooth')}
          >
            Smooth
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Brush Size</h3>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={brushSize}
          onChange={(e) => setBrushSize(parseFloat(e.target.value))}
        />
        <span>{brushSize.toFixed(2)}</span>
      </div>

      <div className="toolbar-section">
        <h3>Brush Strength</h3>
        <input
          type="range"
          min="0.01"
          max="0.5"
          step="0.01"
          value={brushStrength}
          onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
        />
        <span>{brushStrength.toFixed(2)}</span>
      </div>

      <div className="toolbar-section">
        <h3>Rotation</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Auto Rotate
        </label>
        {autoRotate && (
          <div className="rotation-speed">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            />
            <span>{rotationSpeed.toFixed(1)}x</span>
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <div className="instructions">
          <p><strong>Instructions:</strong></p>
          <p>• Click and drag to sculpt (Add mode)</p>
          <p>• Shift+Click to subtract</p>
          <p>• Alt+Click to smooth</p>
          <p>• Ctrl+Click to rotate camera</p>
          <p>• Mouse wheel to zoom</p>
          <p>• Middle-click to pan</p>
          <p>• Auto-rotate continues while sculpting</p>
        </div>
      </div>
    </div>
  )
}

