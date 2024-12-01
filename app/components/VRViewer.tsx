'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { FiZoomIn, FiZoomOut, FiRotateCw, FiRotateCcw } from 'react-icons/fi'

function Model({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={scale} />
}

interface VRViewerProps {
  modelPath: string;
  onClose: () => void;
}

export default function VRViewer({ modelPath, onClose }: VRViewerProps) {
  const [scale, setScale] = useState(1)
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(1)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleRotationSpeedUp = () => {
    setRotationSpeed(prev => Math.min(prev + 1, 5))
  }

  const handleRotationSpeedDown = () => {
    setRotationSpeed(prev => Math.max(prev - 1, 0))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75">
      <div className="relative w-full h-full">
        {/* Contrôles */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Zoom controls */}
          <div className="bg-gray-800 rounded-lg p-2 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
              title="Zoom avant"
            >
              <FiZoomIn className="w-6 h-6" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
              title="Zoom arrière"
            >
              <FiZoomOut className="w-6 h-6" />
            </button>
          </div>

          {/* Rotation controls */}
          <div className="bg-gray-800 rounded-lg p-2 flex flex-col gap-2">
            <button
              onClick={handleRotationSpeedUp}
              className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
              title="Accélérer la rotation"
            >
              <FiRotateCw className="w-6 h-6" />
            </button>
            <button
              onClick={handleRotationSpeedDown}
              className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
              title="Ralentir la rotation"
            >
              <FiRotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Auto-rotation toggle */}
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            className={`p-2 rounded-lg text-white transition-colors ${
              autoRotate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Rotation automatique"
          >
            <FiRotateCw className="w-6 h-6" />
          </button>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Indicateur de chargement */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white text-lg">Chargement du modèle 3D...</div>
        </div>

        {/* Canvas 3D */}
        <div className="w-full h-full bg-gray-900">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6}>
                <Model url={modelPath} scale={scale} />
              </Stage>
              <OrbitControls 
                autoRotate={autoRotate}
                autoRotateSpeed={rotationSpeed}
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  )
} 