import { useEffect, useRef } from "react";
import {
  SAFE_ANCHORS,
  createCarrierPlan,
  sampleHermiteCarrier,
  sampleTravellingHelix,
  smoothstep,
} from "./galleryCometChoreography";

const AGENT_COUNT = 7;
const FIXED_STEP = 1 / 90;
const TRAIL_SAMPLE_STEP = 1 / 60;
const COLORS = [0xfff3d5, 0xefc77e, 0xe9945d, 0xd96f45, 0xb94a2d, 0xf6dfae, 0xe8b56d];
const START_ANCHORS = [0, 5, 2, 6, 1, 3, 7];
const NEXT_ANCHORS = [2, 4, 3, 7, 0, 5, 1];
const PERIMETER_ORDER = [0, 2, 3, 4, 5, 6, 7, 1];
const ENCOUNTER_PATHS = [
  [5, 1],
  [6, 3],
  [0, 4],
  [2, 7],
];
const ENCOUNTER_STYLES = [
  { id: "triple-accelerate", members: 3, turns: 4.2, radius: 1, rotationPower: 2.28, contractionStart: 0.36, duration: 1 },
  { id: "double-orbit", members: 2, turns: 5.1, radius: 0.84, rotationPower: 1.92, contractionStart: 0.32, duration: 0.92 },
  { id: "triple-bloom", members: 3, turns: 3.75, radius: 1.16, rotationPower: 2.62, contractionStart: 0.42, duration: 1.06 },
  { id: "quad-ignition", members: 4, turns: 4.7, radius: 1.08, rotationPower: 2.48, contractionStart: 0.34, duration: 1.1 },
];

const SPARK_VERTEX_SHADER = `
  attribute float aLife;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vLife;

  void main() {
    vLife = aLife;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * uPixelRatio * (5.2 / max(1.0, -viewPosition.z));
  }
`;

const SPARK_FRAGMENT_SHADER = `
  precision highp float;
  uniform vec3 uColor;
  varying float vLife;

  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    float edge = 1.0 - smoothstep(0.12, 0.5, radius);
    float core = 1.0 - smoothstep(0.0, 0.22, radius);
    vec3 color = mix(uColor, vec3(1.0, 0.97, 0.86), core);
    gl_FragColor = vec4(color, edge * pow(vLife, 0.9));
  }
`;

const catmullRom = (p0, p1, p2, p3, amount) => {
  const amount2 = amount * amount;
  const amount3 = amount2 * amount;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * amount +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * amount2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * amount3
  );
};

const createGlowTexture = (THREE) => {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, "rgba(255,255,240,1)");
  gradient.addColorStop(0.13, "rgba(255,229,167,.92)");
  gradient.addColorStop(0.38, "rgba(223,112,54,.38)");
  gradient.addColorStop(1, "rgba(150,45,16,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createStreakTexture = (THREE) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, "rgba(205,91,39,0)");
  gradient.addColorStop(0.48, "rgba(236,151,77,.18)");
  gradient.addColorStop(0.82, "rgba(255,224,158,.74)");
  gradient.addColorStop(1, "rgba(255,255,242,1)");
  context.fillStyle = gradient;
  context.fillRect(0, 20, 256, 24);
  const vertical = context.createLinearGradient(0, 0, 0, 64);
  vertical.addColorStop(0, "rgba(255,255,255,0)");
  vertical.addColorStop(0.5, "rgba(255,255,255,.72)");
  vertical.addColorStop(1, "rgba(255,255,255,0)");
  context.globalCompositeOperation = "destination-in";
  context.fillStyle = vertical;
  context.fillRect(0, 0, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createColorGradient = (THREE, colorValue, pointCount) => {
  const color = new THREE.Color(colorValue);
  const values = [];
  for (let point = 0; point < pointCount; point += 1) {
    const life = 1 - point / Math.max(1, pointCount - 1);
    const intensity = 0.002 + Math.pow(life, 2.65) * 0.998;
    values.push(color.r * intensity, color.g * intensity, color.b * intensity);
  }
  return values;
};

const seededRandom = (state) => {
  let value = state.randomState | 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.randomState = value | 0;
  return (value >>> 0) / 4294967296;
};

export default function GalleryThreadsCanvas() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    if (navigator.connection?.saveData) {
      host.dataset.canvasState = "disabled";
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let cleanupScene = () => {};
    host.dataset.canvasState = "loading";

    const initialize = async () => {
      const [THREE, { Line2 }, { LineGeometry }, { LineMaterial }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/lines/Line2.js"),
        import("three/examples/jsm/lines/LineGeometry.js"),
        import("three/examples/jsm/lines/LineMaterial.js"),
      ]);
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(mobile ? 53 : 44, 1, 0.1, 20);
      camera.position.set(0, 0, 6);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.3));
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.tabIndex = -1;
      host.appendChild(renderer.domElement);

      const rawCount = mobile ? 40 : 56;
      const renderCount = mobile ? 80 : 112;
      const agents = [];
      const lines = [];
      const meteorHeads = [];
      const bounds = new THREE.Vector3(2.8, 1.84, 1.1);
      const scratch = {
        previous: new THREE.Vector3(),
        target: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        normal: new THREE.Vector3(),
        binormal: new THREE.Vector3(),
      };
      let width = 0;
      let height = 0;
      let previousTime = 0;
      let accumulator = 0;
      let encounter = null;
      let encounterCooldown = 0.4;
      let encounterSequence = 0;
      let choreographyEnabled = false;
      const glowTexture = createGlowTexture(THREE);
      const streakTexture = createStreakTexture(THREE);

      const fusionCoreMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffe3a4,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const fusionCore = new THREE.Sprite(fusionCoreMaterial);
      fusionCore.visible = false;
      fusionCore.renderOrder = 6;

      const fusionStreakMaterial = new THREE.SpriteMaterial({
        map: streakTexture,
        color: 0xffd58a,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const fusionStreak = new THREE.Sprite(fusionStreakMaterial);
      fusionStreak.visible = false;
      fusionStreak.renderOrder = 5;

      const burstCount = mobile ? 24 : 38;
      const burstGeometry = new THREE.BufferGeometry();
      burstGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(burstCount * 3), 3));
      burstGeometry.setAttribute("aLife", new THREE.BufferAttribute(new Float32Array(burstCount), 1));
      burstGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(burstCount), 1));
      const burstMaterial = new THREE.ShaderMaterial({
        vertexShader: SPARK_VERTEX_SHADER,
        fragmentShader: SPARK_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Color(0xf2ae62) },
          uPixelRatio: { value: renderer.getPixelRatio() },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const burstPoints = new THREE.Points(burstGeometry, burstMaterial);
      burstPoints.frustumCulled = false;
      burstPoints.renderOrder = 5;
      const burstState = {
        randomState: 0x5f3759df,
        particles: Array.from({ length: burstCount }, () => ({
          position: new THREE.Vector3(),
          velocity: new THREE.Vector3(),
          age: 1,
          duration: 1,
          size: 0,
        })),
      };
      scene.add(fusionStreak, fusionCore, burstPoints);

      const scenePoint = (anchor) => [
        anchor.x * bounds.x,
        anchor.y * bounds.y,
        anchor.z * bounds.z,
      ];

      const createLine = (agent, lineWidth, opacity, layer, color = agent.color) => {
        const geometry = new LineGeometry();
        geometry.setPositions(new Float32Array(renderCount * 3));
        geometry.setColors(createColorGradient(THREE, color, renderCount));
        const material = new LineMaterial({
          color: 0xffffff,
          linewidth: lineWidth,
          vertexColors: true,
          transparent: true,
          opacity,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        });
        const line = new Line2(geometry, material);
        line.frustumCulled = false;
        line.renderOrder = layer === "spine" ? 3 : layer === "core" ? 2 : 1;
        scene.add(line);
        lines.push({ agent, geometry, material, line, baseWidth: lineWidth, baseOpacity: opacity, layer });
      };

      const createMeteorHead = (agent) => {
        const coronaMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          color: agent.color,
          transparent: true,
          opacity: 0.68,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const corona = new THREE.Sprite(coronaMaterial);
        corona.renderOrder = 4;
        const particleCount = mobile ? 8 : 12;
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));
        particleGeometry.setAttribute("aLife", new THREE.BufferAttribute(new Float32Array(particleCount), 1));
        particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(particleCount), 1));
        const particleMaterial = new THREE.ShaderMaterial({
          vertexShader: SPARK_VERTEX_SHADER,
          fragmentShader: SPARK_FRAGMENT_SHADER,
          uniforms: {
            uColor: { value: new THREE.Color(agent.color) },
            uPixelRatio: { value: renderer.getPixelRatio() },
          },
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        });
        const sparks = new THREE.Points(particleGeometry, particleMaterial);
        sparks.frustumCulled = false;
        sparks.renderOrder = 3;
        const particleStates = Array.from({ length: particleCount }, () => ({
          position: agent.position.clone(),
          velocity: new THREE.Vector3(),
          age: 1,
          duration: 1,
          size: 1,
        }));
        scene.add(sparks, corona);
        meteorHeads.push({
          agent,
          corona,
          coronaMaterial,
          sparks,
          particleGeometry,
          particleMaterial,
          particleStates,
          spawnCursor: 0,
          spawnClock: 0,
          randomState: (agent.randomState ^ 0x27d4eb2d) | 0,
        });
      };

      const setCruiseSegment = (agent, targetAnchor = null, preferredDirection = agent.velocity) => {
        if (!targetAnchor && agent.sequence > 1 && seededRandom(agent) < 0.16) {
          agent.ringDirection *= -1;
        }
        const currentPerimeterIndex = PERIMETER_ORDER.findIndex((anchorIndex) => (
          SAFE_ANCHORS[anchorIndex].id === agent.anchorId
        ));
        const nextPerimeterIndex = (currentPerimeterIndex + agent.ringDirection + PERIMETER_ORDER.length) % PERIMETER_ORDER.length;
        const destination = targetAnchor || SAFE_ANCHORS[PERIMETER_ORDER[nextPerimeterIndex]];
        const start = [agent.position.x, agent.position.y, agent.position.z];
        const end = scenePoint(destination);
        const startDirection = preferredDirection.lengthSq() > 0.001
          ? [preferredDirection.x, preferredDirection.y, preferredDirection.z]
          : end.map((value, index) => value - start[index]);
        const endDirection = end.map((value, index) => value - start[index]);
        const distance = Math.hypot(...endDirection);
        const speedVariation = 0.88 + seededRandom(agent) * 0.24;
        agent.segment = {
          carrier: createCarrierPlan({
            start,
            end,
            startDirection,
            endDirection,
            bend: 0.06 + seededRandom(agent) * 0.08,
          }),
          age: 0,
          duration: THREE.MathUtils.clamp(
            (distance / (mobile ? 2.15 : 3.1)) * speedVariation,
            mobile ? 0.9 : 0.72,
            mobile ? 1.85 : 1.42,
          ),
          destination,
          curveAmount: (mobile ? 0.035 : 0.055) + seededRandom(agent) * (mobile ? 0.045 : 0.075),
          curveFrequency: 0.85 + seededRandom(agent) * 0.8,
          curvePhase: seededRandom(agent) * Math.PI * 2,
        };
        agent.anchorId = destination.id;
        agent.sequence += 1;
        agent.mode = "cruise";
      };

      const initializeAgents = () => {
        if (agents.length) return;
        for (let index = 0; index < AGENT_COUNT; index += 1) {
          const startAnchor = SAFE_ANCHORS[START_ANCHORS[index]];
          const nextAnchor = SAFE_ANCHORS[NEXT_ANCHORS[index]];
          const start = scenePoint(startAnchor);
          const next = scenePoint(nextAnchor);
          const position = new THREE.Vector3(...start);
          const velocity = new THREE.Vector3(...next).sub(position).normalize().multiplyScalar(mobile ? 2.15 : 3.05);
          const agent = {
            index,
            color: COLORS[index],
            position,
            velocity,
            mode: "cruise",
            segment: null,
            anchorId: startAnchor.id,
            sequence: index * 3,
            ringDirection: index % 2 === 0 ? 1 : -1,
            randomState: (0x9e3779b9 ^ ((index + 1) * 0x85ebca6b)) | 0,
            trailClock: 0,
            fusionBoost: 0,
            eventVisibility: 1,
            rawTrail: Array.from({ length: rawCount }, () => position.clone()),
            smoothTrail: Array.from({ length: renderCount }, () => position.clone()),
          };
          agents.push(agent);
          createLine(agent, mobile ? 4.2 : 5.3, 0.055, "halo");
          createLine(agent, mobile ? 1.02 : 1.24, 0.9, "core");
          createLine(agent, mobile ? 0.34 : 0.4, 0.82, "spine", 0xfff8e7);
          createMeteorHead(agent);
          setCruiseSegment(agent, nextAnchor, velocity);
        }
      };

      const resize = () => {
        const rect = host.getBoundingClientRect();
        const nextWidth = Math.max(1, Math.round(rect.width));
        const nextHeight = Math.max(1, Math.round(rect.height));
        if (nextWidth === width && nextHeight === height) return;
        width = nextWidth;
        height = nextHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        const visibleHalfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
        bounds.y = visibleHalfHeight * 0.92;
        bounds.x = Math.max(mobile ? 1.18 : 1.82, bounds.y * camera.aspect * 1.04);
        lines.forEach(({ material }) => material.resolution.set(width, height));
        initializeAgents();
      };

      const updateCruise = (agent, delta) => {
        if (!agent.segment) setCruiseSegment(agent);
        const segment = agent.segment;
        segment.age += delta;
        const progress = Math.min(1, segment.age / segment.duration);
        const sample = sampleHermiteCarrier(segment.carrier, progress);
        scratch.previous.copy(agent.position);
        agent.position.set(...sample.position);
        const curveEnvelope = Math.pow(Math.sin(progress * Math.PI), 2);
        const curveWave = Math.sin(progress * Math.PI * 2 * segment.curveFrequency + segment.curvePhase);
        scratch.normal.set(-sample.tangent[1], sample.tangent[0], 0);
        if (scratch.normal.lengthSq() > 0.001) scratch.normal.normalize();
        agent.position.addScaledVector(scratch.normal, curveWave * segment.curveAmount * curveEnvelope);
        agent.position.z += Math.cos(progress * Math.PI * 2 + segment.curvePhase) * segment.curveAmount * 0.42 * curveEnvelope;
        agent.velocity.copy(agent.position).sub(scratch.previous).multiplyScalar(1 / Math.max(delta, 0.001));
        if (progress >= 1) setCruiseSegment(agent, null, agent.velocity);
      };

      const startEncounter = () => {
        const path = ENCOUNTER_PATHS[encounterSequence % ENCOUNTER_PATHS.length];
        const style = ENCOUNTER_STYLES[encounterSequence % ENCOUNTER_STYLES.length];
        const startAnchor = SAFE_ANCHORS[path[0]];
        const destination = SAFE_ANCHORS[path[1]];
        const plannedStart = new THREE.Vector3(...scenePoint(startAnchor));
        const start = plannedStart;
        const memberCount = style.members;
        const members = [...agents]
          .sort((first, second) => first.position.distanceToSquared(plannedStart) - second.position.distanceToSquared(plannedStart))
          .slice(0, memberCount);
        const drift = new THREE.Vector3();
        members.forEach((agent) => {
          drift.add(agent.velocity);
        });
        drift.multiplyScalar(1 / members.length);
        if (drift.lengthSq() < 0.01) drift.set(encounterSequence % 2 ? -1 : 1, 0.2, 0);
        drift.normalize();
        const end = scenePoint(destination);
        const endDirection = new THREE.Vector3(...end).sub(start).normalize();
        const encounterDistance = start.distanceTo(new THREE.Vector3(...end));
        const duration = THREE.MathUtils.clamp(
          encounterDistance / (mobile ? 2.25 : 3.15),
          mobile ? 1.72 : 1.42,
          mobile ? 2.42 : 2.08,
        ) * style.duration;
        encounterSequence += 1;
        encounter = {
          members,
          startPositions: members.map((agent) => agent.position.clone()),
          previousTargets: members.map((agent) => agent.position.clone()),
          carrier: createCarrierPlan({
            start: [start.x, start.y, start.z],
            end,
            startDirection: [drift.x, drift.y, drift.z],
            endDirection: [endDirection.x, endDirection.y, endDirection.z],
            bend: 0.16 + (encounterSequence % 3) * 0.07,
          }),
          age: 0,
          duration,
          turns: style.turns + (encounterSequence % 2) * 0.18,
          radius: (mobile ? 0.18 : 0.245) * style.radius,
          rotationPower: style.rotationPower,
          contractionStart: style.contractionStart,
          styleId: style.id,
          breathPhase: encounterSequence * 1.37,
          direction: encounterSequence % 2 ? 1 : -1,
          previousNormal: null,
          destination,
          startPoint: start.clone(),
          carrierPosition: start.clone(),
          carrierTangent: endDirection.clone(),
          phase: "gather",
          previousPhase: "gather",
          burstTriggered: false,
        };
        members.forEach((agent) => {
          agent.mode = "braid";
          agent.segment = null;
        });
        host.dataset.spiralAgents = String(members.length);
        host.dataset.spiralProgress = "0";
        host.dataset.spiralPhase = "gather";
        host.dataset.encounterZone = destination.id;
        host.dataset.encounterStyle = style.id;
      };

      const finishEncounter = () => {
        if (!encounter) return;
        const finishingEncounter = encounter;
        finishingEncounter.members.forEach((agent) => {
          agent.mode = "cruise";
          agent.fusionBoost = 0;
          agent.eventVisibility = 1;
          setCruiseSegment(agent, null, agent.velocity);
        });
        encounter = null;
        encounterCooldown = 1.35 + (encounterSequence % 3) * 0.34;
        host.dataset.spiralAgents = "0";
        host.dataset.spiralPhase = "idle";
        host.dataset.helixSpread = "0";
      };

      const updateEncounter = (delta) => {
        if (!choreographyEnabled) return;
        if (!encounter) {
          encounterCooldown -= delta;
          if (encounterCooldown <= 0) startEncounter();
          return;
        }

        encounter.age += delta;
        const progress = Math.min(1, encounter.age / encounter.duration);
        const phase = progress < 0.24
          ? "gather"
          : progress < 0.72
            ? "braid"
            : progress < 0.86
              ? "fuse"
              : progress < 0.92
                ? "hold"
                : "burst";
        const contraction = phase === "braid"
          ? smoothstep(progress, encounter.contractionStart, 0.72) * 0.48
          : phase === "fuse"
          ? 0.48 + smoothstep(progress, 0.72, 0.86) * 0.52
          : phase === "hold" || phase === "burst"
            ? 1
            : 0;
        const rotationProgress = progress < 0.86
          ? (0.14 * (progress / 0.86) + 0.86 * Math.pow(progress / 0.86, encounter.rotationPower)) * 0.86
          : progress;
        const travelProgress = progress < 0.24
          ? progress * 0.84
          : 0.2016 + Math.pow((progress - 0.24) / 0.76, 1.16) * 0.7984;

        if (encounter.previousPhase === "gather" && phase === "braid") {
          const preservedSamples = mobile ? 9 : 12;
          encounter.members.forEach((agent) => {
            const cutoff = agent.rawTrail[Math.min(preservedSamples, agent.rawTrail.length - 1)];
            agent.rawTrail.forEach((point, index) => {
              if (index > preservedSamples) point.copy(cutoff);
            });
          });
        }
        encounter.previousPhase = phase;

        const targetPositions = [];
        let sharedNormal = encounter.previousNormal;

        encounter.members.forEach((agent, slot) => {
          agent.eventVisibility = 1;
          const radiusEnvelope = phase === "gather"
            ? 0.62 + smoothstep(progress, 0, 0.24) * 0.38
            : 1
              + Math.sin(rotationProgress * Math.PI * 5.5 + encounter.breathPhase + slot * 0.82) * 0.085 * (1 - contraction)
              + Math.sin(rotationProgress * Math.PI * 12.0 + slot * 1.7) * 0.025 * (1 - contraction);
          const helix = sampleTravellingHelix({
            carrier: encounter.carrier,
            progress: travelProgress,
            rotationProgress,
            slot,
            memberCount: encounter.members.length,
            radius: encounter.radius * radiusEnvelope,
            turns: encounter.turns,
            contraction,
            previousNormal: sharedNormal,
            direction: encounter.direction,
          });
          if (slot === 0) sharedNormal = helix.normal;
          const target = new THREE.Vector3(...helix.position);
          if (phase === "gather") {
            target.lerpVectors(encounter.startPositions[slot], target, smoothstep(progress, 0, 0.24));
          } else if (phase === "burst") {
            const burst = smoothstep(progress, 0.92, 1);
            const angle = (slot / encounter.members.length) * Math.PI * 2 + encounter.direction * 0.5;
            target
              .addScaledVector(new THREE.Vector3(...helix.tangent), burst * (mobile ? 0.24 : 0.38))
              .addScaledVector(new THREE.Vector3(...helix.normal), Math.cos(angle) * burst * (mobile ? 0.24 : 0.36))
              .addScaledVector(new THREE.Vector3(...helix.binormal), Math.sin(angle) * burst * (mobile ? 0.18 : 0.28));
          }
          targetPositions.push(target);
          scratch.previous.copy(agent.position);
          agent.position.lerp(target, 1 - Math.exp(-delta * (phase === "gather" ? 15 : 26)));
          agent.velocity.copy(agent.position).sub(scratch.previous).multiplyScalar(1 / Math.max(delta, 0.001));
          encounter.previousTargets[slot].copy(target);
        });
        encounter.previousNormal = sharedNormal;

        const carrier = sampleHermiteCarrier(encounter.carrier, travelProgress);
        encounter.phase = phase;
        encounter.carrierPosition.set(...carrier.position);
        encounter.carrierTangent.set(...carrier.tangent).normalize();
        const convergence = phase === "fuse"
          ? smoothstep(progress, 0.72, 0.86)
          : phase === "hold" || phase === "burst"
            ? 1
            : 0;
        encounter.members.forEach((agent) => {
          agent.fusionBoost = convergence;
        });
        const travel = new THREE.Vector3(...carrier.position).distanceTo(encounter.startPoint);
        let maximumSpread = 0;
        targetPositions.forEach((first, index) => {
          targetPositions.slice(index + 1).forEach((second) => {
            maximumSpread = Math.max(maximumSpread, first.distanceTo(second));
          });
        });
        host.dataset.spiralProgress = progress.toFixed(3);
        host.dataset.spiralPhase = phase;
        host.dataset.encounterTravel = travel.toFixed(3);
        host.dataset.helixSpread = maximumSpread.toFixed(3);
        host.dataset.helixRotation = rotationProgress.toFixed(3);
        host.dataset.carrierX = carrier.position[0].toFixed(3);
        host.dataset.carrierY = carrier.position[1].toFixed(3);
        if (progress >= 1) finishEncounter();
      };

      const triggerBurst = (origin, tangent) => {
        const forward = scratch.direction.copy(tangent).normalize();
        const side = scratch.normal.set(-forward.y, forward.x, 0.18).normalize();
        const lift = scratch.binormal.copy(forward).cross(side).normalize();
        burstState.particles.forEach((particle, index) => {
          const spread = (index / Math.max(1, burstCount - 1)) - 0.5;
          const randomSide = (seededRandom(burstState) - 0.5) * 1.35 + spread * 0.5;
          const randomLift = (seededRandom(burstState) - 0.5) * 1.05;
          const speed = (mobile ? 0.78 : 1.08) + seededRandom(burstState) * (mobile ? 0.72 : 1.05);
          particle.position.copy(origin).addScaledVector(forward, -0.025);
          particle.velocity.copy(forward).multiplyScalar(speed)
            .addScaledVector(side, randomSide * speed * 0.52)
            .addScaledVector(lift, randomLift * speed * 0.42);
          particle.age = 0;
          particle.duration = 0.24 + seededRandom(burstState) * 0.34;
          particle.size = 1.05 + seededRandom(burstState) * 1.9;
        });
      };

      const updateFusionEffect = (delta, time) => {
        const active = encounter && ["fuse", "hold", "burst"].includes(encounter.phase);
        if (active) {
          const progress = Math.min(1, encounter.age / encounter.duration);
          const arrival = smoothstep(progress, 0.72, 0.84);
          const release = encounter.phase === "burst" ? 1 - smoothstep(progress, 0.92, 1) : 1;
          const strength = arrival * release;
          const pulse = 0.94 + Math.sin(time * 31) * 0.06;
          const size = (mobile ? 0.12 : 0.1) * (0.72 + strength * 0.58) * pulse;
          const tangent = encounter.carrierTangent;

          fusionCore.visible = true;
          fusionCore.position.copy(encounter.carrierPosition);
          fusionCore.scale.setScalar(size);
          fusionCoreMaterial.opacity = 0.22 + strength * 0.68;

          fusionStreak.visible = true;
          fusionStreak.position.copy(encounter.carrierPosition).addScaledVector(tangent, -size * 1.1);
          fusionStreak.scale.set(size * (3.3 + strength * 2.2), size * 0.58, 1);
          fusionStreakMaterial.rotation = Math.atan2(tangent.y, tangent.x);
          fusionStreakMaterial.opacity = 0.14 + strength * 0.7;

          if (encounter.phase === "burst" && !encounter.burstTriggered) {
            encounter.burstTriggered = true;
            triggerBurst(encounter.carrierPosition, tangent);
          }
        } else {
          fusionCore.visible = false;
          fusionStreak.visible = false;
        }

        const positions = burstGeometry.getAttribute("position");
        const lives = burstGeometry.getAttribute("aLife");
        const sizes = burstGeometry.getAttribute("aSize");
        burstState.particles.forEach((particle, index) => {
          particle.age += delta;
          const life = Math.max(0, 1 - particle.age / particle.duration);
          if (life > 0) {
            particle.position.addScaledVector(particle.velocity, delta);
            particle.velocity.multiplyScalar(Math.pow(0.965, delta * 60));
          }
          positions.setXYZ(index, particle.position.x, particle.position.y, particle.position.z);
          lives.setX(index, life);
          sizes.setX(index, particle.size * (0.55 + life * 0.55));
        });
        positions.needsUpdate = true;
        lives.needsUpdate = true;
        sizes.needsUpdate = true;
      };

      const updateTrail = (agent, delta) => {
        agent.trailClock += delta;
        if (agent.trailClock < TRAIL_SAMPLE_STEP) return;
        agent.trailClock %= TRAIL_SAMPLE_STEP;
        agent.rawTrail.unshift(agent.position.clone());
        agent.rawTrail.length = rawCount;
      };

      const isAgentVisible = (agent) => (
        Math.abs(agent.position.x) <= bounds.x * 1.04 &&
        Math.abs(agent.position.y) <= bounds.y * 1.04
      );

      const simulate = (delta) => {
        updateEncounter(delta);
        agents.forEach((agent) => {
          if (agent.mode !== "braid") updateCruise(agent, delta);
          updateTrail(agent, delta);
        });
        host.dataset.visibleAgents = String(agents.filter(isAgentVisible).length);
      };

      const smoothTrails = () => {
        agents.forEach((agent) => {
          const maximum = agent.rawTrail.length - 1;
          for (let point = 0; point < renderCount; point += 1) {
            const rawPosition = (point / (renderCount - 1)) * maximum;
            const index = Math.floor(rawPosition);
            const amount = rawPosition - index;
            const p0 = agent.rawTrail[Math.max(0, index - 1)];
            const p1 = agent.rawTrail[index];
            const p2 = agent.rawTrail[Math.min(maximum, index + 1)];
            const p3 = agent.rawTrail[Math.min(maximum, index + 2)];
            agent.smoothTrail[point].set(
              catmullRom(p0.x, p1.x, p2.x, p3.x, amount),
              catmullRom(p0.y, p1.y, p2.y, p3.y, amount),
              catmullRom(p0.z, p1.z, p2.z, p3.z, amount),
            );
          }
        });
      };

      const updateLines = () => {
        lines.forEach(({ agent, geometry, material, baseWidth, baseOpacity, layer }) => {
          const interleaved = geometry.attributes.instanceStart.data;
          const values = interleaved.array;
          for (let segment = 0; segment < renderCount - 1; segment += 1) {
            const start = agent.smoothTrail[segment];
            const end = agent.smoothTrail[segment + 1];
            const offset = segment * 6;
            values[offset] = start.x;
            values[offset + 1] = start.y;
            values[offset + 2] = start.z;
            values[offset + 3] = end.x;
            values[offset + 4] = end.y;
            values[offset + 5] = end.z;
          }
          interleaved.needsUpdate = true;
          const depthFactor = THREE.MathUtils.clamp(1.02 + agent.position.z * 0.13, 0.82, 1.18);
          const braidFactor = agent.mode === "braid" ? 1.26 + agent.fusionBoost * 0.5 : 1;
          material.linewidth = baseWidth * depthFactor * braidFactor;
          const layerBoost = layer === "spine" ? 0.9 + agent.fusionBoost * 0.28 : 1;
          material.opacity = baseOpacity * (layer === "halo" ? depthFactor : 1) * braidFactor * layerBoost * agent.eventVisibility;
        });
      };

      const updateMeteorHeads = (delta, time) => {
        meteorHeads.forEach((head) => {
          const { agent, corona, coronaMaterial, sparks, particleGeometry, particleStates } = head;
          const speed = agent.velocity.length();
          const direction = scratch.direction.copy(agent.velocity);
          if (direction.lengthSq() < 0.001) direction.set(1, 0, 0);
          direction.normalize();
          const braidBoost = agent.mode === "braid" ? 1.58 : 1;
          const flicker = 0.92 + Math.sin(time * (18 + agent.index * 1.8) + agent.index) * 0.08;
          const headSize = (mobile ? 0.043 : 0.035) * braidBoost * flicker;
          corona.position.copy(agent.position);
          corona.scale.setScalar(headSize);
          coronaMaterial.opacity = (0.5 + flicker * 0.13) * agent.eventVisibility;
          sparks.visible = agent.eventVisibility > 0.08;

          head.spawnClock += delta * (8 + Math.min(9, speed * 1.8)) * braidBoost;
          while (head.spawnClock >= 1) {
            head.spawnClock -= 1;
            const particle = particleStates[head.spawnCursor];
            head.spawnCursor = (head.spawnCursor + 1) % particleStates.length;
            const randomA = seededRandom(head) - 0.5;
            const randomB = seededRandom(head) - 0.5;
            const side = scratch.normal.set(-direction.y, direction.x, randomA * 0.22).normalize();
            const lift = scratch.binormal.copy(direction).cross(side).normalize();
            particle.position.copy(agent.position)
              .addScaledVector(direction, -0.02 - seededRandom(head) * 0.025)
              .addScaledVector(side, randomA * 0.018)
              .addScaledVector(lift, randomB * 0.014);
            particle.velocity.copy(agent.velocity).multiplyScalar(0.08 + seededRandom(head) * 0.08)
              .addScaledVector(direction, -(0.18 + seededRandom(head) * 0.26))
              .addScaledVector(side, randomA * 0.32)
              .addScaledVector(lift, randomB * 0.25);
            particle.age = 0;
            particle.duration = 0.14 + seededRandom(head) * 0.22;
            particle.size = 0.8 + seededRandom(head) * 1.35;
          }

          const positions = particleGeometry.getAttribute("position");
          const lives = particleGeometry.getAttribute("aLife");
          const sizes = particleGeometry.getAttribute("aSize");
          particleStates.forEach((particle, index) => {
            particle.age += delta;
            if (particle.age < particle.duration) particle.position.addScaledVector(particle.velocity, delta);
            const life = Math.max(0, 1 - particle.age / particle.duration);
            positions.setXYZ(index, particle.position.x, particle.position.y, particle.position.z);
            lives.setX(index, life);
            sizes.setX(index, particle.size * (0.65 + life * 0.35));
          });
          positions.needsUpdate = true;
          lives.needsUpdate = true;
          sizes.needsUpdate = true;
        });
      };

      resize();
      for (let warmup = 0; warmup < 120; warmup += 1) simulate(FIXED_STEP);
      choreographyEnabled = true;
      encounterCooldown = 0.18;
      smoothTrails();
      updateLines();
      updateMeteorHeads(0, 0);
      updateFusionEffect(0, 0);
      renderer.render(scene, camera);

      const render = (milliseconds = 0) => {
        animationFrame = 0;
        if (disposed || document.hidden) return;
        const time = milliseconds * 0.001;
        const elapsed = Math.min(0.05, previousTime ? time - previousTime : 1 / 60);
        previousTime = time;
        accumulator += elapsed;
        resize();
        while (accumulator >= FIXED_STEP) {
          simulate(FIXED_STEP);
          accumulator -= FIXED_STEP;
        }
        smoothTrails();
        updateLines();
        updateMeteorHeads(elapsed, time);
        updateFusionEffect(elapsed, time);
        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(render);
      };

      const start = () => {
        if (animationFrame || disposed || document.hidden || reducedMotion) return;
        host.dataset.canvasState = "running";
        previousTime = 0;
        animationFrame = window.requestAnimationFrame(render);
      };
      const stop = () => {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        if (!disposed) host.dataset.canvasState = "paused";
      };
      const onVisibilityChange = () => (document.hidden ? stop() : start());
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      document.addEventListener("visibilitychange", onVisibilityChange);
      if (reducedMotion) host.dataset.canvasState = "static";
      else start();

      cleanupScene = () => {
        stop();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        lines.forEach(({ geometry, material, line }) => {
          geometry.dispose();
          material.dispose();
          line.removeFromParent();
        });
        meteorHeads.forEach(({ corona, coronaMaterial, sparks, particleGeometry, particleMaterial }) => {
          corona.removeFromParent();
          sparks.removeFromParent();
          coronaMaterial.dispose();
          particleGeometry.dispose();
          particleMaterial.dispose();
        });
        glowTexture.dispose();
        streakTexture.dispose();
        fusionCoreMaterial.dispose();
        fusionStreakMaterial.dispose();
        burstGeometry.dispose();
        burstMaterial.dispose();
        fusionCore.removeFromParent();
        fusionStreak.removeFromParent();
        burstPoints.removeFromParent();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(initialize, { timeout: 240 })
      : window.setTimeout(initialize, 40);

    return () => {
      disposed = true;
      if (window.cancelIdleCallback && typeof idleId === "number") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      cleanupScene();
    };
  }, []);

  return <div ref={hostRef} className="nr-gallery-thread-field" aria-hidden="true" />;
}
