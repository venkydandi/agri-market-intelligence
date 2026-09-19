import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCcw, Eye, Info, TrendingUp, CheckCircle } from 'lucide-react';

export default function Agri3DObjectsScene({ className = '', onSelectItem }) {
  const containerRef = useRef(null);
  const [selectedItemName, setSelectedItemName] = useState('All Items');
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const sceneState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    objectsGroup: null,
    items: [],
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(-1000, -1000),
    targetRotX: 0,
    targetRotY: 0,
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
  });

  // ─── 3D Object Procedural Generators ──────────────────────────────────────

  // 1. Procedural 3D Ripe Tomato
  const createTomatoObject = () => {
    const group = new THREE.Group();
    group.name = 'Tomato';
    group.userData = {
      title: 'Hybrid Grade A Tomato',
      mandi: 'Warangal Enumamula APMC',
      rate: '₹25/kg',
      netReturn: '+28% Net',
      demand: 'High wholesale demand across Hyderabad & Warangal',
    };

    // Tomato Body (Squashed sphere)
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
    bodyGeo.scale(1.2, 1.05, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant ripe red
      roughness: 0.22,
      metalness: 0.08,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Green Calyx Leaves (Star pattern)
    const leafCount = 6;
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const leafGeo = new THREE.ConeGeometry(0.22, 0.75, 4);
      leafGeo.rotateX(Math.PI * 0.45);
      leafGeo.rotateY(angle);
      leafGeo.translate(Math.sin(angle) * 0.35, 1.15, Math.cos(angle) * 0.35);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      group.add(leaf);
    }

    // Curved Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.1, 0),
      new THREE.Vector3(0.1, 1.45, 0.05),
      new THREE.Vector3(0.25, 1.7, 0.15),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.08, 8, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    group.add(stem);

    return group;
  };

  // 2. Procedural 3D Sweet Corn Cob
  const createCornObject = () => {
    const group = new THREE.Group();
    group.name = 'Sweet Corn';
    group.userData = {
      title: 'Golden Sweet Corn',
      mandi: 'Bowenpally Wholesale Yard',
      rate: '₹22/kg',
      netReturn: '+22% Net',
      demand: 'Continuous local daily clearance & restaurant supply',
    };

    // Corn Cob Core
    const cobGeo = new THREE.CylinderGeometry(0.7, 0.95, 3.2, 24);
    cobGeo.scale(1, 1, 0.9);

    // Canvas kernel texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#fbbf24';
    for (let y = 0; y < 128; y += 16) {
      for (let x = 0; x < 128; x += 12) {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + 2, y + 2, 8, 12, 3) : ctx.rect(x + 2, y + 2, 8, 12);
        ctx.fill();
      }
    }
    const kernelTex = new THREE.CanvasTexture(canvas);
    kernelTex.wrapS = THREE.RepeatWrapping;
    kernelTex.wrapT = THREE.RepeatWrapping;
    kernelTex.repeat.set(6, 4);

    const cobMat = new THREE.MeshStandardMaterial({
      map: kernelTex,
      color: 0xfffbeb,
      roughness: 0.35,
      metalness: 0.05,
    });
    const cob = new THREE.Mesh(cobGeo, cobMat);
    cob.castShadow = true;
    group.add(cob);

    // Husk Leaves Wrapping Around Base
    const huskMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.45,
      side: THREE.DoubleSide,
    });

    const husk1Geo = new THREE.CylinderGeometry(1.0, 1.1, 2.2, 16, 1, true, 0, Math.PI * 0.9);
    husk1Geo.translate(0, -0.6, 0);
    const husk1 = new THREE.Mesh(husk1Geo, huskMat);
    group.add(husk1);

    const husk2Geo = new THREE.CylinderGeometry(0.95, 1.05, 2.0, 16, 1, true, Math.PI * 0.8, Math.PI * 0.9);
    husk2Geo.translate(0, -0.7, 0);
    const husk2 = new THREE.Mesh(husk2Geo, huskMat);
    group.add(husk2);

    // Top Silk Tassel
    const silkGeo = new THREE.ConeGeometry(0.35, 0.9, 8);
    silkGeo.translate(0, 1.9, 0);
    const silkMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const silk = new THREE.Mesh(silkGeo, silkMat);
    group.add(silk);

    return group;
  };

  // 3. Procedural 3D Guntur Red Chilli
  const createChilliObject = () => {
    const group = new THREE.Group();
    group.name = 'Red Chilli';
    group.userData = {
      title: 'Teja Premium Red Chilli',
      mandi: 'Guntur Asia Mirchi Yard',
      rate: '₹120/kg',
      netReturn: '+41% Net',
      demand: 'Highest export arbitrage & bulk trader volume',
    };

    // Curved Horn Geometry
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(0.2, 0.5, 0.1),
      new THREE.Vector3(0.5, -0.3, 0.25),
      new THREE.Vector3(0.7, -1.1, 0.15),
      new THREE.Vector3(0.65, -1.8, -0.1),
    ]);

    const chilliGeo = new THREE.TubeGeometry(curve, 24, 0.38, 12, false);
    const chilliMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Spicy glossy red
      roughness: 0.18,
      metalness: 0.12,
    });
    const chilli = new THREE.Mesh(chilliGeo, chilliMat);
    chilli.castShadow = true;
    group.add(chilli);

    // Green Calyx Cap & Curled Stem
    const capGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.25, 12);
    capGeo.translate(0, 1.25, 0);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
    const cap = new THREE.Mesh(capGeo, capMat);
    group.add(cap);

    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(-0.15, 1.65, 0.1),
      new THREE.Vector3(-0.3, 1.85, 0.2),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.07, 8, false);
    const stem = new THREE.Mesh(stemGeo, capMat);
    group.add(stem);

    return group;
  };

  // 4. Procedural 3D Pink / Red Onion
  const createOnionObject = () => {
    const group = new THREE.Group();
    group.name = 'Red Onion';
    group.userData = {
      title: 'Nashik / Kurnool Pink Onion',
      mandi: 'Kurnool & Bowenpally Yard',
      rate: '₹24/kg',
      netReturn: '+32% Net',
      demand: 'Daily kitchen staple with continuous high turnover',
    };

    // Teardrop Shaped Bulb
    const bulbGeo = new THREE.SphereGeometry(1.15, 32, 32);
    bulbGeo.scale(1.15, 1.35, 1.15);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xc026d3, // Vibrant onion pink/purple
      roughness: 0.3,
      metalness: 0.05,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.castShadow = true;
    group.add(bulb);

    // Top Green Sprout Tip
    const sproutGeo = new THREE.ConeGeometry(0.18, 0.9, 8);
    sproutGeo.translate(0, 1.8, 0);
    const sproutMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const sprout = new THREE.Mesh(sproutGeo, sproutMat);
    group.add(sprout);

    // Root Fibers at Base
    const rootGeo = new THREE.ConeGeometry(0.3, 0.45, 8);
    rootGeo.rotateX(Math.PI);
    rootGeo.translate(0, -1.6, 0);
    const rootMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.7 });
    const root = new THREE.Mesh(rootGeo, rootMat);
    group.add(root);

    return group;
  };

  // 5. Procedural 3D Wooden APMC Produce Crate
  const createCrateObject = () => {
    const group = new THREE.Group();
    group.name = 'Mandi Crate';
    group.userData = {
      title: 'APMC Logistics Produce Crate',
      mandi: 'All Regional Hubs',
      rate: 'Grade A Standard',
      netReturn: '₹0 Commission Box',
      demand: 'Standardized 25 kg transit crate for perishables',
    };

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Rich amber wood
      roughness: 0.6,
      metalness: 0.05,
    });

    // Outer Slats (Box)
    const boxGeo = new THREE.BoxGeometry(2.4, 1.4, 1.8);
    const box = new THREE.Mesh(boxGeo, woodMat);
    box.castShadow = true;
    group.add(box);

    // Metal Corner Brackets
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.7,
    });
    const corners = [
      [-1.2, 0, -0.9],
      [1.2, 0, -0.9],
      [-1.2, 0, 0.9],
      [1.2, 0, 0.9],
    ];
    corners.forEach(([x, y, z]) => {
      const bGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.45, 8);
      const b = new THREE.Mesh(bGeo, bracketMat);
      b.position.set(x, y, z);
      group.add(b);
    });

    // Produce Fill inside Crate
    const produceColors = [0xef4444, 0xf59e0b, 0x16a34a, 0xc026d3];
    for (let i = 0; i < 9; i++) {
      const pGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const pMat = new THREE.MeshStandardMaterial({
        color: produceColors[i % produceColors.length],
        roughness: 0.25,
      });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(
        ((i % 3) - 1) * 0.65,
        0.75 + (i % 2) * 0.15,
        (Math.floor(i / 3) - 1) * 0.55
      );
      group.add(p);
    }

    return group;
  };

  // 6. Procedural 3D Mini Transport Delivery Truck
  const createTruckObject = () => {
    const group = new THREE.Group();
    group.name = 'Transport Truck';
    group.userData = {
      title: 'Tata Ace / Small Commercial Van',
      mandi: 'Real-Time Highway Transit',
      rate: '₹8/km Freight Cost',
      netReturn: '1.5 Ton Capacity',
      demand: 'Optimized fuel consumption & fast mandi turnaround',
    };

    // Truck Cab
    const cabGeo = new THREE.BoxGeometry(1.2, 1.3, 1.2);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.2 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(1.0, 0.25, 0);
    cab.castShadow = true;
    group.add(cab);

    // Windshield
    const glassGeo = new THREE.BoxGeometry(0.3, 0.55, 1.05);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, metalness: 0.8 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(1.5, 0.45, 0);
    group.add(glass);

    // Cargo Container
    const cargoGeo = new THREE.BoxGeometry(2.0, 1.4, 1.3);
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(-0.6, 0.35, 0);
    cargo.castShadow = true;
    group.add(cargo);

    // Chassis / Base
    const chassisGeo = new THREE.BoxGeometry(3.2, 0.25, 1.1);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0.1, -0.4, 0);
    group.add(chassis);

    // 4 Wheels
    const wheelPositions = [
      [1.0, -0.65, 0.65],
      [1.0, -0.65, -0.65],
      [-0.8, -0.65, 0.65],
      [-0.8, -0.65, -0.65],
    ];
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);
    });

    return group;
  };

  // ─── Main Three.js Scene Setup ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneState.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 16);
    sceneState.current.camera = camera;

    // 2. High-Fidelity WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    sceneState.current.renderer = renderer;

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Primary Warm Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(12, 18, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    scene.add(sunLight);

    // Blue Sky Fill Light
    const skyFillLight = new THREE.DirectionalLight(0xbae6fd, 1.2);
    skyFillLight.position.set(-12, 8, -6);
    scene.add(skyFillLight);

    // Soft Rim Light
    const rimLight = new THREE.DirectionalLight(0x34d399, 0.8);
    rimLight.position.set(0, -10, -10);
    scene.add(rimLight);

    // 4. Subtle Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(35, 20);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 5. Build 3D Items Orbit Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    sceneState.current.objectsGroup = objectsGroup;

    // Instantiate all 6 Agricultural 3D Objects
    const tomato = createTomatoObject();
    const corn = createCornObject();
    const chilli = createChilliObject();
    const onion = createOnionObject();
    const crate = createCrateObject();
    const truck = createTruckObject();

    // Position items in an aesthetic 3D spatial orbit
    const itemsConfig = [
      { mesh: tomato, pos: [-4.8, 1.2, 1.5], scale: 1.15, speed: 0.8, rotSpeed: [0.01, 0.015, 0.005] },
      { mesh: corn, pos: [-1.8, -1.2, 2.5], scale: 0.95, speed: 1.1, rotSpeed: [0.008, 0.012, 0.01] },
      { mesh: chilli, pos: [1.6, 1.6, 2.0], scale: 1.2, speed: 0.9, rotSpeed: [0.012, 0.018, 0.008] },
      { mesh: onion, pos: [4.8, -0.6, 1.2], scale: 1.05, speed: 1.0, rotSpeed: [0.01, 0.014, 0.006] },
      { mesh: crate, pos: [-3.2, -2.4, -1.0], scale: 0.9, speed: 0.7, rotSpeed: [0.005, 0.008, 0.004] },
      { mesh: truck, pos: [3.4, 2.2, -1.2], scale: 0.85, speed: 0.75, rotSpeed: [0.006, 0.01, 0.005] },
    ];

    const sceneItems = [];

    itemsConfig.forEach((cfg, idx) => {
      const m = cfg.mesh;
      m.position.set(...cfg.pos);
      m.scale.setScalar(cfg.scale);
      m.userData.origPos = new THREE.Vector3(...cfg.pos);
      m.userData.origScale = cfg.scale;
      m.userData.speed = cfg.speed;
      m.userData.rotSpeed = cfg.rotSpeed;
      m.userData.phase = idx * 1.1;

      objectsGroup.add(m);
      sceneItems.push(m);
    });

    sceneState.current.items = sceneItems;

    // 6. Floating Glistening Particles / Spores in 3D space
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 22;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Pointer & Mouse Event Listeners
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      sceneState.current.mouse.set(normX, normY);

      if (sceneState.current.isDragging) {
        const deltaX = e.clientX - sceneState.current.prevMouseX;
        const deltaY = e.clientY - sceneState.current.prevMouseY;
        sceneState.current.targetRotY += deltaX * 0.005;
        sceneState.current.targetRotX += deltaY * 0.005;
        sceneState.current.prevMouseX = e.clientX;
        sceneState.current.prevMouseY = e.clientY;
      }
    };

    const handleMouseDown = (e) => {
      sceneState.current.isDragging = true;
      sceneState.current.prevMouseX = e.clientX;
      sceneState.current.prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      sceneState.current.isDragging = false;
    };

    const handleClick = () => {
      const state = sceneState.current;
      state.raycaster.setFromCamera(state.mouse, camera);
      const intersects = state.raycaster.intersectObjects(sceneItems, true);

      if (intersects.length > 0) {
        // Find top-level group
        let hitGroup = intersects[0].object;
        while (hitGroup.parent && hitGroup.parent !== objectsGroup) {
          hitGroup = hitGroup.parent;
        }

        if (hitGroup && hitGroup.userData && hitGroup.userData.title) {
          setSelectedItemName(hitGroup.name);
          setHoveredInfo(hitGroup.userData);
          // Spin celebration
          hitGroup.rotation.y += Math.PI * 2;
          if (onSelectItem) onSelectItem(hitGroup.userData);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. 60 FPS Dynamic Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const state = sceneState.current;

      // Group rotation (auto-rotate + user drag damping)
      if (autoRotate && !state.isDragging) {
        state.targetRotY += 0.002;
      }
      objectsGroup.rotation.y += (state.targetRotY - objectsGroup.rotation.y) * 0.08;
      objectsGroup.rotation.x += (state.targetRotX - objectsGroup.rotation.x) * 0.08;

      // Interactive Individual 3D Objects Motion (Floating bob, spin, bounce)
      sceneItems.forEach((item) => {
        const p = item.userData.phase;
        const speed = item.userData.speed;
        const orig = item.userData.origPos;

        // Smooth vertical wave motion
        item.position.y = orig.y + Math.sin(elapsed * speed + p) * 0.35;
        // Subtle horizontal float
        item.position.x = orig.x + Math.cos(elapsed * speed * 0.7 + p) * 0.15;

        // Continuous tumbling rotation
        item.rotation.x += item.userData.rotSpeed[0];
        item.rotation.y += item.userData.rotSpeed[1];
        item.rotation.z += item.userData.rotSpeed[2];
      });

      // Raycasting for Hover Highlights
      state.raycaster.setFromCamera(state.mouse, camera);
      const intersects = state.raycaster.intersectObjects(sceneItems, true);

      if (intersects.length > 0) {
        let hitGroup = intersects[0].object;
        while (hitGroup.parent && hitGroup.parent !== objectsGroup) {
          hitGroup = hitGroup.parent;
        }
        if (hitGroup && hitGroup.userData) {
          setHoveredInfo(hitGroup.userData);
          container.style.cursor = 'pointer';
        }
      } else if (!state.isDragging) {
        container.style.cursor = 'grab';
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate, onSelectItem]);

  // Focus on specific crop
  const handleFilterCrop = (name) => {
    setSelectedItemName(name);
    const state = sceneState.current;
    if (!state.items) return;

    state.items.forEach((item) => {
      if (name === 'All Items' || item.name === name) {
        item.visible = true;
        item.scale.setScalar(item.userData.origScale * (name !== 'All Items' ? 1.4 : 1.0));
        if (name !== 'All Items') {
          setHoveredInfo(item.userData);
        }
      } else {
        item.visible = false;
      }
    });
  };

  const resetCamera = () => {
    sceneState.current.targetRotX = 0;
    sceneState.current.targetRotY = 0;
    handleFilterCrop('All Items');
  };

  return (
    <div className={`relative w-full h-[520px] sm:h-[580px] lg:h-[640px] select-none ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-3xl"
        title="Click & drag to rotate 3D agricultural items!"
      />

      {/* Floating 3D Item Telemetry Card (Displays on Hover / Selection) */}
      {hoveredInfo && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-2xl border border-gray-100 text-gray-900 animate-slide-up z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                {hoveredInfo.title}
              </h4>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              {hoveredInfo.netReturn}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-600 font-medium leading-relaxed">
            <span className="font-bold text-sky-700">{hoveredInfo.mandi}</span> • {hoveredInfo.rate}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {hoveredInfo.demand}
          </p>
        </div>
      )}

      {/* Top 3D Control Bar & Quick-Select Filter Tabs */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Quick Item Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/20 text-white text-xs font-bold shadow-xl overflow-x-auto max-w-full">
          {['All Items', 'Tomato', 'Sweet Corn', 'Red Chilli', 'Red Onion', 'Mandi Crate', 'Transport Truck'].map((item) => (
            <button
              key={item}
              onClick={() => handleFilterCrop(item)}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                selectedItemName === item
                  ? 'bg-white text-gray-950 font-black shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item === 'Tomato' && '🍅 '}
              {item === 'Sweet Corn' && '🌽 '}
              {item === 'Red Chilli' && '🌶️ '}
              {item === 'Red Onion' && '🧅 '}
              {item === 'Mandi Crate' && '📦 '}
              {item === 'Transport Truck' && '🚚 '}
              {item}
            </button>
          ))}
        </div>

        {/* 3D Orbit Controls */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold shadow-xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
              autoRotate ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/70'
            }`}
            title="Toggle 3D auto orbit"
          >
            <Sparkles className="w-3 h-3" />
            <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            title="Reset 3D Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
