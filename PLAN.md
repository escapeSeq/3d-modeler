# 3D Modeler Application - Implementation Plan

## Overview
A web-based 3D modeling application that allows users to sculpt 3D models using mouse interaction. The model appears as clay and can be rotated or remain static.

## Technology Stack

### Frontend
- **ReactJS** - UI framework
- **Three.js** - 3D graphics library
- **React Three Fiber (R3F)** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **zustand** or **React Context** - State management
- **Vite** - Build tool and dev server

### Backend
- **Node.js/Express** (optional) - For future features like saving models
- Currently: Frontend-only application

### Containerization
- **Docker** - Container runtime
- **Docker Compose** - Orchestration
- **nginx** - Web server for production build

## Architecture

```
┌─────────────────────────────────────┐
│         Docker Compose              │
│  ┌───────────────────────────────┐  │
│  │    Frontend Container         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   React App (Vite)      │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  Three.js/R3F     │  │  │  │
│  │  │  │  - 3D Scene        │  │  │  │
│  │  │  │  - Clay Shader     │  │  │  │
│  │  │  │  - Mouse Controls  │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   nginx (production)    │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## File Structure

```
3dmodeler/
├── docker-compose.yml
├── README.md
├── PLAN.md
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── components/
│       │   ├── Scene3D.jsx
│       │   ├── ClayModel.jsx
│       │   ├── Controls.jsx
│       │   └── Toolbar.jsx
│       ├── hooks/
│       │   ├── useMouseSculpting.js
│       │   └── useRotation.js
│       ├── shaders/
│       │   └── clayShader.js
│       ├── utils/
│       │   ├── geometryUtils.js
│       │   └── mouseUtils.js
│       └── styles/
│           └── index.css
```

## Core Features

### 1. 3D Scene Setup
- Three.js scene with camera, lights, and renderer
- Perspective camera with orbit controls
- Ambient and directional lighting for clay appearance

### 2. Clay Model
- **Initial Geometry**: Sphere or box as starting point
- **Clay Material**: Custom shader with:
  - Subsurface scattering effect
  - Soft, matte appearance
  - Earthy color palette (browns, tans, beiges)
  - Subtle specular highlights
- **Mesh**: Deformable geometry (BufferGeometry)

### 3. Mouse Interaction
- **Raycasting**: Detect mouse position in 3D space
- **Sculpting Modes**:
  - **Add**: Push vertices outward (extrude)
  - **Subtract**: Push vertices inward (carve)
  - **Smooth**: Average nearby vertices
- **Brush Size**: Adjustable radius
- **Brush Strength**: Intensity of deformation

### 4. Rotation Control
- Toggle between static and auto-rotation
- Manual rotation via mouse drag (OrbitControls)
- Rotation speed control

### 5. UI Components
- **Toolbar**: Mode selection, brush size, rotation toggle
- **Canvas**: Full-screen 3D viewport
- **Info Panel**: Instructions and shortcuts

## Implementation Steps

### Phase 1: Project Setup
1. Create docker-compose.yml
2. Set up React + Vite project structure
3. Create Dockerfiles (dev and production)
4. Configure nginx for production
5. Basic React app with Three.js integration

### Phase 2: 3D Scene Foundation
1. Set up React Three Fiber
2. Create basic 3D scene with camera and lights
3. Add OrbitControls for camera movement
4. Render a simple sphere

### Phase 3: Clay Material
1. Create custom clay shader
2. Implement subsurface scattering
3. Apply material to model
4. Fine-tune colors and lighting

### Phase 4: Mouse Sculpting
1. Implement raycasting for mouse position
2. Create vertex deformation system
3. Add sculpting modes (add/subtract/smooth)
4. Implement brush size and strength controls
5. Add visual feedback (brush indicator)

### Phase 5: Rotation Feature
1. Add auto-rotation toggle
2. Implement rotation animation
3. Add rotation speed control
4. Ensure rotation works with sculpting
5. Keep rotating while clicking the sculpt

### Phase 6: UI Polish
1. Create toolbar component
2. Add controls for all features
3. Style the interface
4. Add keyboard shortcuts
5. Responsive design

### Phase 7: Optimization
1. Performance optimization
2. Geometry update optimization
3. Memory management
4. Testing and bug fixes

## Docker Configuration

### Development
- Hot module replacement
- Volume mounting for live code updates
- Development server on port 3000

### Production
- Build React app
- Serve via nginx
- Optimized production build
- Port 80

## Technical Details

### Clay Shader Approach
```glsl
// Vertex shader: Standard transformations
// Fragment shader: 
- Base color (clay brown)
- Fresnel effect for edges
- Soft lighting
- Minimal specular
```

### Geometry Deformation
- Use BufferGeometry for efficient updates
- Modify vertex positions based on mouse interaction
- Update normals after deformation
- Use requestAnimationFrame for smooth updates

### Mouse Interaction
- Convert 2D mouse coordinates to 3D ray
- Find intersection with model
- Modify vertices within brush radius
- Smooth interpolation for natural sculpting

## Dependencies

### Frontend Package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## Future Enhancements (Optional)
- Save/load models
- Export to OBJ/STL
- Multiple brush types
- Undo/redo functionality
- Texture painting
- Model import
- Backend API for model storage

## Getting Started

1. Ensure Docker and Docker Compose are installed
2. Run `docker-compose up`
3. Access application at `http://localhost:3000` (dev) or `http://localhost` (prod)

## Notes
- All dependencies managed via Docker
- No Node.js or npm required on host machine
- Development and production environments included
- Hot reload in development mode

