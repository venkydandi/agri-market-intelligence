import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Agri3DHero() {
  const mountRef = useRef(null);
  const [activeMarket, setActiveMarket] = useState('Warangal APMC Yard');
  const [activeMetrics, setActiveMetrics] = useState({ price: '₹92/kg', returnRate: '+24% Net' });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group to hold all rotating elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 2. Main Central Digital Sphere (Agri-Network Core)
    const sphereRadius = 5.2;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    
    // Wireframe outer sphere
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x15803d,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
    globeGroup.add(wireMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(sphereRadius * 0.96, 32, 32);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x064e3b,
      emissive: 0x022c22,
      specular: 0x34d399,
      shininess: 30,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerMesh);

    // 3. Floating Seed / Spore Particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x34d399); // Emerald
    const color2 = new THREE.Color(0xfbbf24); // Amber gold

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = sphereRadius + 0.3 + Math.random() * 2.2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const chosenColor = Math.random() > 0.4 ? color1 : color2;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 4. Market Node Beacons (Telangana / AP region coordinates mapped on sphere)
    const marketNodes = [
      { name: 'Hyderabad Bowenpally', lat: 17.47, lng: 78.48, color: 0x10b981 },
      { name: 'Warangal Enumamula', lat: 17.97, lng: 79.59, color: 0xf59e0b },
      { name: 'Nizamabad APMC', lat: 18.67, lng: 78.09, color: 0x3b82f6 },
      { name: 'Guntur Mirchi Yard', lat: 16.30, lng: 80.43, color: 0xef4444 },
      { name: 'Khammam APMC', lat: 17.24, lng: 80.15, color: 0x10b981 },
      { name: 'Karimnagar Yard', lat: 18.43, lng: 79.12, color: 0xf59e0b },
      { name: 'Kurnool APMC', lat: 15.82, lng: 78.03, color: 0x06b6d4 },
    ];

    function latLngToVector3(lat, lng, radius) {
      // Map local coordinates into visible sphere front hemisphere
      const phi = (90 - (lat - 17.0) * 12.0) * (Math.PI / 180);
      const theta = ((lng - 79.0) * 12.0 + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const nodeVectors = marketNodes.map((m) => {
      const v = latLngToVector3(m.lat, m.lng, sphereRadius * 1.02);
      // Small glowing beacon sphere
      const nodeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: m.color })
      );
      nodeMesh.position.copy(v);
      globeGroup.add(nodeMesh);

      // Outer radar ring
      const ringGeo = new THREE.RingGeometry(0.24, 0.32, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: m.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(v);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);

      return v;
    });

    // 5. 3D Supply Chain Bezier Trade Arcs
    const arcPointsList = [];
    for (let i = 0; i < nodeVectors.length; i++) {
      for (let j = i + 1; j < nodeVectors.length; j++) {
        if (Math.random() > 0.4) {
          const v1 = nodeVectors[i];
          const v2 = nodeVectors[j];
          const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
          // Lift mid point outward to form a 3D parabolic flight arc
          mid.normalize().multiplyScalar(sphereRadius + 1.6 + Math.random() * 0.8);

          const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
          const pts = curve.getPoints(32);
          arcPointsList.push(pts);

          const curveGeo = new THREE.BufferGeometry().setFromPoints(pts);
          const curveMat = new THREE.LineBasicMaterial({
            color: i % 2 === 0 ? 0x34d399 : 0xfbbf24,
            transparent: true,
            opacity: 0.45,
            linewidth: 1,
          });
          const arcLine = new THREE.Line(curveGeo, curveMat);
          globeGroup.add(arcLine);
        }
      }
    }

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x34d399, 2.2);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.4);
    dirLight2.position.set(-10, -10, -5);
    scene.add(dirLight2);

    // Initial orientation to showcase nodes
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.y = -0.4;

    // 7. Mouse Drag & Parallax Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = globeGroup.rotation.y;
    let targetRotX = globeGroup.rotation.x;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.005;
        targetRotX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Subtle hover parallax
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        globeGroup.position.x = normX * 0.4;
        globeGroup.position.y = normY * 0.4;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Dynamic rotation of highlights
    let marketTick = 0;
    const marketInterval = setInterval(() => {
      marketTick = (marketTick + 1) % marketNodes.length;
      const m = marketNodes[marketTick];
      setActiveMarket(m.name);
      const samplePrices = ['₹94/kg', '₹28/kg', '₹64/kg', '₹115/kg', '₹22/kg'];
      const sampleReturns = ['+28% Net', '+19% Net', '+32% Net', '+41% Net', '+15% Net'];
      setActiveMetrics({
        price: samplePrices[marketTick % samplePrices.length],
        returnRate: sampleReturns[marketTick % sampleReturns.length],
      });
    }, 3200);

    // 8. Animation Loop
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth damped rotation
      if (!isDragging) {
        targetRotY += 0.003;
      }
      globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.08;

      // Particle breathing pulsation
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const factor = 1 + Math.sin(elapsed * 2 + i) * 0.0008;
        pos[i * 3] *= factor;
        pos[i * 3 + 1] *= factor;
        pos[i * 3 + 2] *= factor;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(marketInterval);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Futuristic 3D HUD Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-white shadow-2xl max-w-xs animate-fade-in pointer-events-none">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">Live APMC Geo-Arc</span>
        </div>
        <div className="text-sm font-extrabold text-gray-100">{activeMarket}</div>
        <div className="mt-2 flex items-center justify-between text-xs border-t border-gray-800 pt-2">
          <span className="text-gray-400">Current Rate:</span>
          <span className="font-bold text-amber-400">{activeMetrics.price}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-gray-400">Net Return Advantage:</span>
          <span className="font-bold text-emerald-400">{activeMetrics.returnRate}</span>
        </div>
      </div>

      {/* 3D Drag Hint - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-gray-300 border border-white/10 pointer-events-none">
        <span className="animate-pulse">🌐</span>
        <span>Interactive 3D Supply Network • Drag to Rotate</span>
      </div>
    </div>
  );
}
