import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Sparkles, Sun, Droplets, Play, Pause } from 'lucide-react';

export default function SkyVideo3D({ className = '', onSplashTrigger }) {
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const soundNodesRef = useRef(null);

  // User UI controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [skyPreset, setSkyPreset] = useState('sunny'); // 'sunny' | 'golden' | 'fresh'
  const [splashActive, setSplashActive] = useState(true);
  const [fps, setFps] = useState(60);

  // Scene references for live uniform updates
  const sceneRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    cloudMeshes: [],
    dropletPoints: null,
    dropletPositions: null,
    dropletVelocities: null,
    dropletOriginals: null,
    godRaysGroup: null,
    sunMesh: null,
    mouse: new THREE.Vector2(0, 0),
    targetMouse: new THREE.Vector2(0, 0),
    burstParticles: [],
    skyMaterial: null,
  });

  // ─── Procedural Texture Generators ───────────────────────────────────────
  // Generate soft volumetric cloud texture using HTML5 Canvas (zero external requests)
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.65)');
    grad.addColorStop(0.7, 'rgba(240, 248, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Add smaller puff clusters for realistic cumulus density
    const puffs = [
      { x: 90, y: 100, r: 60, a: 0.4 },
      { x: 160, y: 110, r: 70, a: 0.45 },
      { x: 120, y: 150, r: 65, a: 0.35 },
      { x: 80, y: 140, r: 50, a: 0.3 },
      { x: 170, y: 140, r: 55, a: 0.35 },
    ];

    puffs.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(255, 255, 255, ${p.a})`);
      g.addColorStop(0.7, `rgba(255, 255, 255, ${p.a * 0.4})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  };

  // Generate crystal water droplet sprite with specular highlight
  const createWaterDropletTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Outer soft glow
    const outerGlow = ctx.createRadialGradient(64, 64, 20, 64, 64, 60);
    outerGlow.addColorStop(0, 'rgba(215, 240, 255, 0.6)');
    outerGlow.addColorStop(0.8, 'rgba(180, 225, 255, 0.2)');
    outerGlow.addColorStop(1, 'rgba(180, 225, 255, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Droplet body (glassy refraction)
    const bodyGrad = ctx.createRadialGradient(56, 52, 6, 64, 64, 48);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    bodyGrad.addColorStop(0.4, 'rgba(200, 235, 255, 0.7)');
    bodyGrad.addColorStop(0.85, 'rgba(130, 200, 250, 0.4)');
    bodyGrad.addColorStop(1, 'rgba(100, 180, 240, 0.15)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(64, 64, 46, 0, Math.PI * 2);
    ctx.fill();

    // Sharp specular glint
    const glint = ctx.createRadialGradient(50, 46, 0, 50, 46, 16);
    glint.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glint.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    glint.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(50, 46, 16, 0, Math.PI * 2);
    ctx.fill();

    // Secondary rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 44, Math.PI * 0.7, Math.PI * 1.4);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  };

  // Generate glowing sun disc
  const createSunTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
    grad.addColorStop(0.2, 'rgba(255, 240, 180, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 210, 120, 0.4)');
    grad.addColorStop(0.8, 'rgba(255, 180, 80, 0.15)');
    grad.addColorStop(1, 'rgba(255, 150, 50, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  };

  // ─── Click to Splash Burst Spawner ───────────────────────────────────────
  const triggerSplashBurst = useCallback((screenX, screenY) => {
    const refs = sceneRefs.current;
    if (!refs.scene || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = screenX ?? rect.width * 0.65;
    const y = screenY ?? rect.height * 0.45;

    // Convert screen coordinates to Three.js world space coordinates
    const normX = ((x - rect.left) / rect.width) * 2 - 1;
    const normY = -(((y - rect.top) / rect.height) * 2 - 1);

    const worldPos = new THREE.Vector3(normX * 12, normY * 7, 3);

    // Spawn 32 splash micro-droplets
    const splashCount = 32;
    const splashGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(splashCount * 3);
    const velocities = [];

    for (let i = 0; i < splashCount; i++) {
      positions[i * 3] = worldPos.x;
      positions[i * 3 + 1] = worldPos.y;
      positions[i * 3 + 2] = worldPos.z;

      // Radial explosive velocity with upward bias
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.12 + Math.random() * 0.22;
      velocities.push({
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.8 + 0.14, // upward spray
        vz: (Math.random() - 0.5) * 0.15,
        life: 1.0,
        decay: 0.016 + Math.random() * 0.018,
      });
    }

    splashGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const splashMat = new THREE.PointsMaterial({
      size: 0.65,
      map: createWaterDropletTexture(),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const splashPoints = new THREE.Points(splashGeo, splashMat);
    refs.scene.add(splashPoints);

    refs.burstParticles.push({
      mesh: splashPoints,
      geo: splashGeo,
      velocities,
      positions,
      count: splashCount,
    });

    if (onSplashTrigger) onSplashTrigger({ x, y });
  }, [onSplashTrigger]);

  // ─── Web Audio API Summer Breeze & Nature Synthesizer ────────────────────
  const toggleAudio = () => {
    if (!isMuted) {
      // Mute
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
      setIsMuted(true);
      return;
    }

    // Unmute: Initialize or resume audio context
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // 1. Soft wind noise generator using filtered white noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02; // pink noise filter
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter for whispering wind effect
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.setValueAtTime(320, ctx.currentTime);
        windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(ctx.destination);
        whiteNoise.start();

        // 2. Subtle harmonic sun warmth tone
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(174, ctx.currentTime); // Solfeggio healing frequency
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.018, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();

        soundNodesRef.current = { whiteNoise, windFilter, windGain, osc, oscGain };
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      setIsMuted(false);
    } catch {
      setIsMuted(true);
    }
  };

  // ─── Main Three.js Scene Setup ───────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRefs.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);
    sceneRefs.current.camera = camera;

    // 2. WebGL Renderer with High Dynamic Precision
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    sceneRefs.current.renderer = renderer;

    // 3. Dynamic Sky Gradient Background Plane
    const skyGeo = new THREE.PlaneGeometry(80, 50);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1976d2) },     // Deep sunny azure
        midColor: { value: new THREE.Color(0x38bdf8) },     // Vibrant sky blue
        bottomColor: { value: new THREE.Color(0xebf8ff) },  // Soft horizon haze
        sunPosition: { value: new THREE.Vector2(0.2, 0.7) },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform vec2 sunPosition;
        uniform float time;
        varying vec2 vUv;

        void main() {
          // Three-stop smooth atmospheric gradient
          vec3 sky;
          if (vUv.y > 0.5) {
            float factor = (vUv.y - 0.5) * 2.0;
            sky = mix(midColor, topColor, factor);
          } else {
            float factor = vUv.y * 2.0;
            sky = mix(bottomColor, midColor, factor);
          }

          // Subtle sun glow gradient
          float sunDist = distance(vUv, sunPosition);
          float sunGlow = exp(-sunDist * 3.2) * 0.45;
          sky += vec3(1.0, 0.96, 0.85) * sunGlow;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(0, 0, -25);
    scene.add(skyMesh);
    sceneRefs.current.skyMaterial = skyMat;

    // 4. Glowing Sun Disc & Crepuscular God-Rays
    const sunTexture = createSunTexture();
    const sunMat = new THREE.SpriteMaterial({
      map: sunTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    const sunSprite = new THREE.Sprite(sunMat);
    sunSprite.position.set(-6.5, 6.2, -18);
    sunSprite.scale.set(10, 10, 1);
    scene.add(sunSprite);
    sceneRefs.current.sunMesh = sunSprite;

    // God-Rays Light Shafts
    const godRaysGroup = new THREE.Group();
    godRaysGroup.position.copy(sunSprite.position);

    const rayCount = 8;
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfff3c4,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 0.85 - 0.4;
      const rayLength = 35 + Math.random() * 10;
      const rayWidth = 1.4 + Math.random() * 1.8;
      const rayGeo = new THREE.ConeGeometry(rayWidth, rayLength, 4);
      rayGeo.rotateZ(angle);
      rayGeo.translate(0, -rayLength * 0.5, 0);

      const rayMesh = new THREE.Mesh(rayGeo, rayMat);
      godRaysGroup.add(rayMesh);
    }
    scene.add(godRaysGroup);
    sceneRefs.current.godRaysGroup = godRaysGroup;

    // 5. Procedural 3D Volumetric Drifting Clouds (Multi-layer timelapse loop)
    const cloudTexture = createCloudTexture();
    const cloudCount = 14;
    const cloudMeshes = [];

    for (let i = 0; i < cloudCount; i++) {
      const cloudMat = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.45 + Math.random() * 0.35,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const cloud = new THREE.Sprite(cloudMat);
      // Distribute along x, y, and depth z
      const startX = -28 + (i * 56) / cloudCount + (Math.random() - 0.5) * 4;
      const startY = -1.5 + Math.random() * 8.5;
      const startZ = -14 + Math.random() * 8; // Layered depth
      const scale = 9 + Math.random() * 8;

      cloud.position.set(startX, startY, startZ);
      cloud.scale.set(scale, scale * 0.65, 1);

      // Custom velocity per depth layer (parallax timelapse)
      cloud.userData = {
        baseSpeed: 0.008 + (startZ + 14) * 0.002, // Near clouds drift faster
        yBobOffset: Math.random() * Math.PI * 2,
        origScale: scale,
      };

      scene.add(cloud);
      cloudMeshes.push(cloud);
    }
    sceneRefs.current.cloudMeshes = cloudMeshes;

    // 6. 3D Floating Physical Water Droplets & Liquid Mist
    const dropletCount = 160;
    const dropletGeo = new THREE.BufferGeometry();
    const dropletPositions = new Float32Array(dropletCount * 3);
    const dropletOriginals = new Float32Array(dropletCount * 3);
    const dropletVelocities = new Float32Array(dropletCount * 3);
    const dropletScales = new Float32Array(dropletCount);

    for (let i = 0; i < dropletCount; i++) {
      // Position spread across visible frustum
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 14;
      const z = -4 + Math.random() * 10;

      dropletPositions[i * 3] = x;
      dropletPositions[i * 3 + 1] = y;
      dropletPositions[i * 3 + 2] = z;

      dropletOriginals[i * 3] = x;
      dropletOriginals[i * 3 + 1] = y;
      dropletOriginals[i * 3 + 2] = z;

      dropletVelocities[i * 3] = 0;
      dropletVelocities[i * 3 + 1] = 0;
      dropletVelocities[i * 3 + 2] = 0;

      dropletScales[i] = 0.25 + Math.random() * 0.55;
    }

    dropletGeo.setAttribute('position', new THREE.BufferAttribute(dropletPositions, 3));
    dropletGeo.setAttribute('scale', new THREE.BufferAttribute(dropletScales, 1));

    const dropletMat = new THREE.PointsMaterial({
      size: 0.7,
      map: createWaterDropletTexture(),
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const dropletPoints = new THREE.Points(dropletGeo, dropletMat);
    scene.add(dropletPoints);

    sceneRefs.current.dropletPoints = dropletPoints;
    sceneRefs.current.dropletPositions = dropletPositions;
    sceneRefs.current.dropletOriginals = dropletOriginals;
    sceneRefs.current.dropletVelocities = dropletVelocities;

    // 7. Mouse and Pointer Interaction
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      sceneRefs.current.targetMouse.set(normX, normY);
    };

    const handleClick = (e) => {
      if (!splashActive) return;
      triggerSplashBurst(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. 60 FPS Animation Loop
    let animId;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isPlaying) {
        renderer.render(scene, camera);
        return;
      }

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Smooth mouse damping
      const refs = sceneRefs.current;
      refs.mouse.lerp(refs.targetMouse, 0.05);

      // Camera subtle parallax
      camera.position.x = refs.mouse.x * 0.8;
      camera.position.y = refs.mouse.y * 0.4;
      camera.lookAt(0, 0, 0);

      // Update Sky Shader uniforms
      if (refs.skyMaterial) {
        refs.skyMaterial.uniforms.time.value = elapsed;
      }

      // Rotate God-Rays and pulse sun
      if (refs.godRaysGroup) {
        refs.godRaysGroup.rotation.z = elapsed * 0.035;
        const pulse = 1.0 + Math.sin(elapsed * 1.5) * 0.04;
        refs.godRaysGroup.scale.set(pulse, pulse, 1);
      }

      // Drift 3D Clouds (Continuous Timelapse Loop)
      refs.cloudMeshes.forEach((cloud) => {
        cloud.position.x += cloud.userData.baseSpeed;
        // Soft vertical bob
        cloud.position.y += Math.sin(elapsed * 0.4 + cloud.userData.yBobOffset) * 0.0015;

        // Wrap around right boundary to create infinite timelapse loop
        if (cloud.position.x > 26) {
          cloud.position.x = -26;
          cloud.position.y = -1.5 + Math.random() * 8.5;
        }
      });

      // Update 3D Water Droplets with Aerodynamic Drag & Cursor Repulsion
      if (refs.dropletPoints && refs.dropletPositions && refs.dropletVelocities) {
        const pos = refs.dropletPositions;
        const orig = refs.dropletOriginals;
        const vel = refs.dropletVelocities;
        const mouseWorldX = refs.mouse.x * 12;
        const mouseWorldY = refs.mouse.y * 7;

        for (let i = 0; i < dropletCount; i++) {
          const idx = i * 3;

          // Natural buoyant drift
          pos[idx] += Math.sin(elapsed * 0.6 + i) * 0.002;
          pos[idx + 1] += Math.cos(elapsed * 0.8 + i) * 0.003 - 0.001; // subtle downward fall

          // Wrap droplets if fallen below horizon
          if (pos[idx + 1] < -8) {
            pos[idx + 1] = 8;
            pos[idx] = (Math.random() - 0.5) * 26;
          }

          // Aerodynamic vortex around mouse pointer
          const dx = pos[idx] - mouseWorldX;
          const dy = pos[idx + 1] - mouseWorldY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 9.0) {
            const dist = Math.sqrt(distSq) || 0.001;
            const force = (1.0 - dist / 3.0) * 0.06;
            vel[idx] += (dx / dist) * force;
            vel[idx + 1] += (dy / dist) * force;
          }

          // Apply velocity with damping
          pos[idx] += vel[idx];
          pos[idx + 1] += vel[idx + 1];
          vel[idx] *= 0.92;
          vel[idx + 1] *= 0.92;

          // Spring return to original trajectory
          pos[idx] += (orig[idx] - pos[idx]) * 0.002;
        }
        refs.dropletPoints.geometry.attributes.position.needsUpdate = true;
      }

      // Update Dynamic Splash Bursts
      for (let b = refs.burstParticles.length - 1; b >= 0; b--) {
        const burst = refs.burstParticles[b];
        let alive = false;

        for (let p = 0; p < burst.count; p++) {
          const v = burst.velocities[p];
          if (v.life > 0) {
            alive = true;
            burst.positions[p * 3] += v.vx;
            burst.positions[p * 3 + 1] += v.vy;
            burst.positions[p * 3 + 2] += v.vz;

            // Gravity on splash droplets
            v.vy -= 0.006;
            v.life -= v.decay;
          }
        }

        burst.geo.attributes.position.needsUpdate = true;
        burst.mesh.material.opacity = Math.max(0, burst.velocities[0]?.life || 0);

        if (!alive) {
          scene.remove(burst.mesh);
          burst.geo.dispose();
          burst.mesh.material.dispose();
          refs.burstParticles.splice(b, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [triggerSplashBurst, splashActive, isPlaying]);

  // ─── Sky Preset Switcher Updates ─────────────────────────────────────────
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs.skyMaterial) return;

    if (skyPreset === 'sunny') {
      refs.skyMaterial.uniforms.topColor.value.setHex(0x1976d2);    // Sunny azure
      refs.skyMaterial.uniforms.midColor.value.setHex(0x38bdf8);    // Crisp blue
      refs.skyMaterial.uniforms.bottomColor.value.setHex(0xebf8ff); // White haze
      if (refs.sunMesh) refs.sunMesh.material.color.setHex(0xffffff);
    } else if (skyPreset === 'golden') {
      refs.skyMaterial.uniforms.topColor.value.setHex(0x0284c7);    // Evening blue
      refs.skyMaterial.uniforms.midColor.value.setHex(0xf59e0b);    // Golden amber
      refs.skyMaterial.uniforms.bottomColor.value.setHex(0xfef3c7); // Sunset cream
      if (refs.sunMesh) refs.sunMesh.material.color.setHex(0xffeedd);
    } else if (skyPreset === 'fresh') {
      refs.skyMaterial.uniforms.topColor.value.setHex(0x0284c7);    // Cool cyan
      refs.skyMaterial.uniforms.midColor.value.setHex(0x06b6d4);    // Refreshing turquoise
      refs.skyMaterial.uniforms.bottomColor.value.setHex(0xe0f7fa); // Dew mist
      if (refs.sunMesh) refs.sunMesh.material.color.setHex(0xdcfce7);
    }
  }, [skyPreset]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-crosshair select-none"
        title="Click anywhere to trigger 3D water splashes!"
      />

      {/* Floating Senior-Dev Video & Atmosphere HUD Control Dock */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-2xl text-xs font-semibold">
        {/* Preset Selector */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5">
          <button
            onClick={() => setSkyPreset('sunny')}
            className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 ${
              skyPreset === 'sunny' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-white/80 hover:text-white'
            }`}
            title="Sunny Sky"
          >
            <Sun className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Sunny</span>
          </button>
          <button
            onClick={() => setSkyPreset('golden')}
            className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 ${
              skyPreset === 'golden' ? 'bg-amber-400 text-gray-950 font-bold shadow-sm' : 'text-white/80 hover:text-white'
            }`}
            title="Golden Harvest"
          >
            <span>🌾</span>
            <span className="hidden sm:inline">Golden</span>
          </button>
          <button
            onClick={() => setSkyPreset('fresh')}
            className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 ${
              skyPreset === 'fresh' ? 'bg-cyan-400 text-gray-950 font-bold shadow-sm' : 'text-white/80 hover:text-white'
            }`}
            title="Tropical Dew"
          >
            <Droplets className="w-3 h-3 text-cyan-700" />
            <span className="hidden sm:inline">Dew</span>
          </button>
        </div>

        {/* Splash Toggle */}
        <button
          onClick={() => setSplashActive(!splashActive)}
          className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 ${
            splashActive ? 'bg-sky-500/80 text-white font-bold' : 'bg-white/10 text-white/60'
          }`}
          title="Toggle interactive water splash click effect"
        >
          <Sparkles className="w-3 h-3 text-cyan-200" />
          <span className="hidden md:inline">Splash</span>
        </button>

        {/* Ambient Nature Breeze Audio Synthesizer */}
        <button
          onClick={toggleAudio}
          className={`p-1.5 rounded-full transition-all flex items-center gap-1 ${
            !isMuted ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-white/70 hover:text-white'
          }`}
          title={isMuted ? 'Play ambient summer farm breeze' : 'Mute ambient sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
        </button>

        {/* Play/Pause 3D Engine */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          title={isPlaying ? 'Pause 3D Sky Video' : 'Resume 3D Sky Video'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        {/* 60 FPS Badge */}
        <div className="hidden lg:flex items-center gap-1.5 pl-1 text-[10px] font-mono text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{fps} FPS 3D</span>
        </div>
      </div>
    </div>
  );
}
