import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import CONSULTANTS from '../../data/consultants.json';

const PARTICLE_COUNT = 300;

function GlobeMesh() {
  const globeRef = useState(() => new THREE.Group())[0];
  const nodeRef = useState(() => new THREE.Group())[0];
  const ring1Ref = useState(() => new THREE.Group())[0];
  const ring2Ref = useState(() => new THREE.Group())[0];
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;
    if (globeRef) globeRef.rotation.y = t * 0.5;
    if (nodeRef) nodeRef.rotation.y = t * 0.5;
    if (ring1Ref) ring1Ref.rotation.z = t * 0.3;
    if (ring2Ref) ring2Ref.rotation.y = t * 0.2;

    nodeRef.children.forEach(c => {
      const s = 0.8 + Math.sin(t * 4 + c.userData.pulsePhase) * 0.5;
      c.scale.setScalar(s);
    });
  });

  const nodeColors = [0x00D4FF, 0x7B2FFF, 0x00FFB3, 0xFFB800];

  return (
    <>
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[1.2, 48, 48]} />
          <meshBasicMaterial color={0x00D4FF} wireframe transparent opacity={0.12} />
        </mesh>
      </group>

      <group ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.25, 0.008, 16, 100]} />
          <meshBasicMaterial color={0x00D4FF} transparent opacity={0.5} />
        </mesh>
      </group>

      <group ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.25, 0.008, 16, 100]} />
          <meshBasicMaterial color={0x7B2FFF} transparent opacity={0.35} />
        </mesh>
      </group>

      <group ref={nodeRef}>
        {CONSULTANTS.consultants.map((c, i) => {
          const phi   = i * 0.7 + 0.5;
          const theta = i * 1.3 + 0.3;
          const x = 1.21 * Math.sin(phi) * Math.cos(theta);
          const y = 1.21 * Math.cos(phi);
          const z = 1.21 * Math.sin(phi) * Math.sin(theta);
          const col = nodeColors[i % nodeColors.length];

          return (
            <mesh key={c.id} position={[x, y, z]} userData={{ pulsePhase: i * (Math.PI / 4) }}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={col} />
            </mesh>
          );
        })}
      </group>

      <Stars />
    </>
  );
}

function Stars() {
  const [positions] = useState(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i*3] = (Math.random() - 0.5) * 8;
      pos[i*3+1] = (Math.random() - 0.5) * 6;
      pos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  });

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#1E6FFF" size={0.025} sizeAttenuation={true} opacity={0.5} />
    </Points>
  );
}

const SplashPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  const labels = [
    'Initializing Agents...',
    'Loading Resume Agent...',
    'Syncing Attendance Agent...',
    'Activating Opportunity Agent...',
    'Deploying Training Agent...',
    'Activating AI Framework...',
    `System Ready ✦ — ${CONSULTANTS.consultants.length} Consultants Loaded`
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= labels.length) {
        clearInterval(interval);
        setTimeout(() => navigate('/home'), 800);
      } else {
        setOpacity(0);
        setTimeout(() => {
          setStep(currentStep);
          setOpacity(1);
        }, 200);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [navigate]);

  const p = Math.round((step / (labels.length - 1)) * 100);

  return (
    <PageTransition>
      <section className="page active" style={{ display: 'flex' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Canvas camera={{ position: [0, 0, 3.2], fov: 60 }}>
            <GlobeMesh />
          </Canvas>
        </div>

        <div className="splash-content">
          <div className="splash-logo-container">
            <div className="splash-hex-ring2"></div>
            <div className="splash-hex-ring"></div>
            <div className="splash-hex-inner">H</div>
          </div>
          <div>
            <div className="splash-title">Hexaware</div>
            <div className="splash-subtitle">Pool Consultant Management System</div>
          </div>
          <div className="splash-progress-wrapper">
            <div 
              className="splash-progress-label"
              style={{ opacity, transition: 'opacity 0.2s ease' }}
            >
              {labels[step] || labels[labels.length - 1]}
            </div>
            <div className="splash-progress-track">
              <div className="splash-progress-fill" style={{ width: `${p}%` }}></div>
            </div>
            <div className="splash-percent">{p}%</div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default SplashPage;
