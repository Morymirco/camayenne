'use client'

import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

type VRViewerProps = {
  modelUrl: string
  onClose: () => void
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1} />
}

export default function VRViewer({ modelUrl, onClose }: VRViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Canvas camera={{ position: [0, 2, 5] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model url={modelUrl} />
          <OrbitControls autoRotate />
        </Suspense>
      </Canvas>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
      >
        ✕
      </button>
    </div>
  )
} 