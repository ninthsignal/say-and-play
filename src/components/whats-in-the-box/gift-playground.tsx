"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { useDrag } from "@use-gesture/react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import * as THREE from "three";

import { AudioPromptButton } from "@/components/audio/audio-prompt-button";
import { Button } from "@/components/ui/button";
import { useSpeechSettings } from "@/components/speech/settings-context";
import { phrasesMatch } from "@/lib/speech";

const BOAT_COLORS = {
  red: 0xe94b4b,
  yellow: 0xf6c21b,
  cyan: 0x20c6d3,
  gray: 0x2a2a2a,
};

const ROCKET_COLORS = {
  red: 0xe94b4b,
  gray: 0x6e6e6e,
  white: 0xf3f1ec,
  flame: 0xffa400,
  cyan: 0x20c6d3,
};

const ROBOT_COLORS = {
  white: 0xdde3ea,
  red: 0xff4b4b,
  blue: 0x3da5ff,
  yellow: 0xffd84b,
  gray: 0xaaaaaa,
  black: 0x111111,
};

function PlasticMaterial({ color, ...props }: { color: number } & THREE.MeshPhysicalMaterialParameters) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.2}
      metalness={0}
      clearcoat={0.6}
      clearcoatRoughness={0.15}
      envMapIntensity={1}
      {...props}
    />
  );
}

function roundedRectShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

function ToyBoat({ floating = false }: { floating?: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const baseY = 0.3;
  const baseRotationY = Math.PI / 12;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    if (floating) {
      const t = clock.getElapsedTime();
      const floatOffset = Math.sin(t * 1.2) * 0.14;
      group.position.set(0, baseY + floatOffset, 0);
      group.rotation.set(Math.sin(t * 0.6) * 0.03, baseRotationY, Math.sin(t * 0.9) * 0.05);
    } else {
      group.position.set(0, baseY, 0);
      group.rotation.set(0, baseRotationY, 0);
    }
  });

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(0, baseY, 0);
    groupRef.current.rotation.set(0, baseRotationY, 0);
  }, [baseY, baseRotationY]);

  const hullShape = useMemo(() => {
    const shape = new THREE.Shape();
    const L = 3.2;
    const H = 1.4;
    const r = 0.7;

    shape.moveTo(-L / 2, 0.15 * H);
    shape.lineTo(L / 2 - r, 0.15 * H);
    shape.quadraticCurveTo(L / 2, 0.15 * H, L / 2, 0.35 * H);
    shape.lineTo(L / 2, -0.45 * H);
    shape.quadraticCurveTo(L / 2 - 0.5, -0.6 * H, L / 2 - 1.1, -0.6 * H);
    shape.lineTo(-L / 2 + 0.2, -0.6 * H);
    shape.quadraticCurveTo(-L / 2 - 0.1, -0.05 * H, -L / 2, 0.15 * H);

    return shape;
  }, []);

  const deckShape = useMemo(() => roundedRectShape(2.2, 0.8, 0.35), []);
  const cabinShape = useMemo(() => roundedRectShape(1.9, 0.85, 0.35), []);
  const windowPositions = useMemo(() => [-1, 0, 1].map((x) => x * 0.5), []);

  return (
    <group ref={groupRef} scale={0.35}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[
            hullShape,
            {
              depth: 0.8,
              bevelEnabled: true,
              bevelThickness: 0.08,
              bevelSize: 0.08,
              bevelSegments: 8,
              curveSegments: 48,
            },
          ]}
        />
        <PlasticMaterial color={BOAT_COLORS.red} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.25, 0.05]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            deckShape,
            {
              depth: 0.7,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 6,
              curveSegments: 36,
            },
          ]}
        />
        <PlasticMaterial color={BOAT_COLORS.yellow} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.95, 0.2]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            cabinShape,
            {
              depth: 0.7,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 6,
              curveSegments: 36,
            },
          ]}
        />
        <PlasticMaterial color={BOAT_COLORS.red} roughness={0.22} />
      </mesh>

      {windowPositions.map((x) => (
        <group key={`window-${x}`}>
          <mesh position={[x, 0.95, 0.55]} rotation={[0, Math.PI / 2, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.23, 0.23, 0.12, 32, 1, true]} />
            <PlasticMaterial color={BOAT_COLORS.gray} roughness={0.35} />
          </mesh>
          <mesh position={[x, 0.95, 0.6]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 32]} />
            <PlasticMaterial color={BOAT_COLORS.cyan} roughness={0.05} metalness={0.1} />
          </mesh>
        </group>
      ))}

      <mesh position={[-0.35, 1.35, 0.2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.14, 0.25, 16, 32]} />
        <PlasticMaterial color={BOAT_COLORS.yellow} roughness={0.25} />
      </mesh>
      <mesh position={[0.35, 1.45, 0.2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.17, 0.45, 16, 32]} />
        <PlasticMaterial color={BOAT_COLORS.cyan} roughness={0.18} />
      </mesh>
    </group>
  );
}

function ToyRocket({ floating = false }: { floating?: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const baseY = 0.4;
  const bodyRadius = 0.7;
  const bodyHeight = 2.4;
  const noseHeight = 0.85;
  const bodyGeometry = useMemo(() => new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 64), []);
  const noseGeometry = useMemo(() => new THREE.ConeGeometry(bodyRadius, noseHeight, 64), []);
  const wingGeometry = useMemo(() => {
    const depth = 0.08;
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.48);
    shape.lineTo(0, 0.48);
    shape.lineTo(0.42, 0);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }, []);
  const windowGeometry = useMemo(() => new THREE.RingGeometry(0.18, 0.26, 48, 1), []);
  const windowCapGeometry = useMemo(() => new THREE.CircleGeometry(0.18 * 0.92, 48), []);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      noseGeometry.dispose();
      windowGeometry.dispose();
      windowCapGeometry.dispose();
      wingGeometry.dispose();
    },
    [bodyGeometry, noseGeometry, windowGeometry, windowCapGeometry, wingGeometry],
  );

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(0, baseY, 0);
    groupRef.current.rotation.set(0, 0, 0);
  }, [baseY]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    if (floating) {
      const t = clock.getElapsedTime();
      group.position.set(0, baseY + Math.sin(t * 1.3) * 0.18, 0);
      group.rotation.set(Math.sin(t * 0.6) * 0.05, Math.sin(t * 0.4) * 0.08, Math.sin(t * 0.7) * 0.04);
    } else {
      group.position.set(0, baseY, 0);
      group.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef} scale={0.32}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <PlasticMaterial color={ROCKET_COLORS.white} roughness={0.28} />
      </mesh>
      <mesh geometry={noseGeometry} position={[0, bodyHeight / 2 + noseHeight / 2, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROCKET_COLORS.red} roughness={0.24} />
      </mesh>
      <mesh geometry={wingGeometry} position={[bodyRadius - 0.01, -bodyHeight / 2 + 0.48, 0]} receiveShadow>
        <PlasticMaterial color={ROCKET_COLORS.red} roughness={0.24} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        geometry={wingGeometry}
        position={[-(bodyRadius - 0.01), -bodyHeight / 2 + 0.48, 0]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <PlasticMaterial color={ROCKET_COLORS.red} roughness={0.24} side={THREE.DoubleSide} />
      </mesh>
      {[0.6, -0.2].map((y) => (
        <group key={`porthole-${y}`} position={[0, y, bodyRadius + 0.06]}>
          <mesh geometry={windowGeometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROCKET_COLORS.gray} roughness={0.35} />
          </mesh>
          <mesh geometry={windowCapGeometry} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.002]} castShadow receiveShadow>
            <PlasticMaterial color={ROCKET_COLORS.cyan} roughness={0.22} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function useFloatingGroup(enabled: boolean, basePosition: THREE.Vector3, rotationOffsets: THREE.Vector3) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(basePosition);
    groupRef.current.rotation.set(0, rotationOffsets.y, 0);
  }, [basePosition, rotationOffsets.y]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    if (enabled) {
      const t = clock.getElapsedTime();
      group.position.set(
        basePosition.x + Math.sin(t * 0.6) * rotationOffsets.x,
        basePosition.y + Math.sin(t * 1.4) * rotationOffsets.z,
        basePosition.z,
      );
      group.rotation.set(Math.sin(t * 0.5) * 0.05, rotationOffsets.y, Math.sin(t * 0.75) * 0.04);
    } else {
      group.position.copy(basePosition);
      group.rotation.set(0, rotationOffsets.y, 0);
    }
  });

  return groupRef;
}

function ToyMagicWand() {
  const groupRef = useRef<THREE.Group | null>(null);

  const pinkMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xf47dbb,
        roughness: 0.22,
        metalness: 0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1,
      }),
    [],
  );
  const purpleMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xb67cf2,
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.18,
        envMapIntensity: 0.9,
      }),
    [],
  );

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 5;
    const outerRadius = 0.92;
    const innerRadius = 0.42;
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.24,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 96,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const stickGeometry = useMemo(() => new THREE.CylinderGeometry(0.18, 0.18, 2.5, 48), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(0.26, 0.06, 32, 72), []);

  useEffect(
    () => () => {
      starGeometry.dispose();
      stickGeometry.dispose();
      ringGeometry.dispose();
      pinkMaterial.dispose();
      purpleMaterial.dispose();
    },
    [pinkMaterial, purpleMaterial, ringGeometry, starGeometry, stickGeometry],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = 0.95 + Math.sin(t * 1.4) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 0.55) * 0.04;
      groupRef.current.rotation.x = Math.cos(t * 0.35) * 0.02;
    }
  });

  return (
    <group ref={groupRef} scale={0.5} position={[0, 0.78, 0.18]} rotation={[0, Math.PI / 12, 0]}>
      <mesh
        geometry={starGeometry}
        material={pinkMaterial}
        position={[0, 0.9, 0]}
        rotation={[0, 0, -Math.PI / 5]}
        castShadow
        receiveShadow
      />
      <group position={[0, 0.1, 0]}>
        <mesh geometry={stickGeometry} material={purpleMaterial} position={[0, -0.6, 0]} castShadow receiveShadow />
        <mesh
          geometry={ringGeometry}
          material={purpleMaterial}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, Math.PI / 7]}
        />
        <mesh
          geometry={ringGeometry}
          material={purpleMaterial}
          position={[0, -0.32, 0]}
          rotation={[Math.PI / 2, 0, -Math.PI / 8]}
        />
      </group>
    </group>
  );
}

function AnimatedPrizeGem({ color, label, floating = false }: { color: string; label: string; floating?: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(0, 0, 0);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.6;
    groupRef.current.position.y = floating ? Math.sin(t * 1.8) * 0.08 : 0;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.35} />
      </mesh>
      <Html position={[0, 0.9, 0]} center>
        <div className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-purple-700 shadow">{label}</div>
      </Html>
    </group>
  );
}

function ToyRobot({ floating = false }: { floating?: boolean }) {
  const basePosition = useMemo(() => new THREE.Vector3(0, 0.6, 0), []);
  const movement = useMemo(() => new THREE.Vector3(0.06, Math.PI / 8, 0.14), []);
  const groupRef = useFloatingGroup(floating, basePosition, movement);

  const headGeometry = useMemo(() => new THREE.BoxGeometry(2.4, 1.6, 1.4), []);
  const eyeGeometry = useMemo(() => new THREE.SphereGeometry(0.15, 32, 16), []);
  const earGeometry = useMemo(() => new THREE.SphereGeometry(0.25, 32, 16), []);
  const antennaCone = useMemo(() => new THREE.ConeGeometry(0.1, 0.4, 32), []);
  const antennaBall = useMemo(() => new THREE.SphereGeometry(0.15, 32, 16), []);
  const torsoGeometry = useMemo(() => new THREE.BoxGeometry(1.8, 1.2, 1.2), []);
  const panelGeometry = useMemo(() => new THREE.BoxGeometry(1.0, 0.5, 0.05), []);
  const hipGeometry = useMemo(() => new THREE.BoxGeometry(1.4, 0.4, 0.8), []);
  const armGeometry = useMemo(() => new THREE.CylinderGeometry(0.12, 0.12, 0.7, 32), []);
  const jointGeometry = useMemo(() => new THREE.SphereGeometry(0.22, 32, 16), []);
  const handGeometry = useMemo(() => new THREE.SphereGeometry(0.28, 32, 16), []);
  const legGeometry = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 0.8, 32), []);
  const footGeometry = useMemo(() => new THREE.SphereGeometry(0.35, 32, 16), []);

  useEffect(
    () => () => {
      headGeometry.dispose();
      eyeGeometry.dispose();
      earGeometry.dispose();
      antennaCone.dispose();
      antennaBall.dispose();
      torsoGeometry.dispose();
      panelGeometry.dispose();
      hipGeometry.dispose();
      armGeometry.dispose();
      jointGeometry.dispose();
      handGeometry.dispose();
      legGeometry.dispose();
      footGeometry.dispose();
    },
    [
      antennaBall,
      antennaCone,
      armGeometry,
      footGeometry,
      handGeometry,
      headGeometry,
      jointGeometry,
      legGeometry,
      panelGeometry,
      hipGeometry,
      earGeometry,
      eyeGeometry,
      torsoGeometry,
    ],
  );

  return (
    <group ref={groupRef} rotation={[0, 0, 0]} scale={0.42}>
      <mesh geometry={headGeometry} position={[0, 2.5, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.white} roughness={0.18} metalness={0.18} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={`eye-${side}`} geometry={eyeGeometry} position={[side * 0.6, 2.55, 0.75]}>
          <PlasticMaterial color={ROBOT_COLORS.black} roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
      {([-1, 1] as const).map((side) => (
        <mesh key={`ear-${side}`} geometry={earGeometry} position={[side * 1.25, 2.5, 0]} castShadow receiveShadow>
          <PlasticMaterial color={ROBOT_COLORS.red} roughness={0.26} />
        </mesh>
      ))}
      <mesh geometry={antennaCone} position={[0, 3.3, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.gray} roughness={0.3} />
      </mesh>
      <mesh geometry={antennaBall} position={[0, 3.55, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.yellow} roughness={0.25} />
      </mesh>

      <mesh geometry={torsoGeometry} position={[0, 1.3, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.white} roughness={0.18} metalness={0.18} />
      </mesh>
      <mesh geometry={panelGeometry} position={[0, 1.3, 0.63]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.yellow} roughness={0.28} />
      </mesh>
      <mesh geometry={hipGeometry} position={[0, 0.5, 0]} castShadow receiveShadow>
        <PlasticMaterial color={ROBOT_COLORS.blue} roughness={0.28} />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <group key={`arm-${side}`}>
          <mesh geometry={jointGeometry} position={[side * 1.3, 1.4, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROBOT_COLORS.blue} roughness={0.3} />
          </mesh>
          <mesh geometry={armGeometry} position={[side * 1.3, 0.9, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROBOT_COLORS.gray} roughness={0.32} />
          </mesh>
          <mesh geometry={handGeometry} position={[side * 1.3, 0.5, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROBOT_COLORS.red} roughness={0.28} />
          </mesh>
        </group>
      ))}

      {([-1, 1] as const).map((side) => (
        <group key={`leg-${side}`}>
          <mesh geometry={legGeometry} position={[side * 0.4, -0.1, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROBOT_COLORS.blue} roughness={0.26} />
          </mesh>
          <mesh geometry={footGeometry} position={[side * 0.4, -0.85, 0]} castShadow receiveShadow>
            <PlasticMaterial color={ROBOT_COLORS.red} roughness={0.24} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export type GiftDefinition = {
  id: string;
  title: string;
  description: string;
  baseColor: string;
  ribbonColor: string;
  accentColor: string;
  pattern?: "solid" | "polka" | "stripes";
  prizeColor: string;
  prizeLabel: string;
};

export type VoicePromptConfig = {
  id: string;
  label: string;
  audio: string;
  phraseVariants: string[];
  target: { type: "gift"; giftId: string } | { type: "first" } | { type: "last" };
};

type GiftPlaygroundProps = {
  gifts: GiftDefinition[];
  prompts: VoicePromptConfig[];
};

type RotationMap = Record<string, number>;
type FractionMap = Record<string, number>;

const BOX_SPACING = 3.4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function reorderList<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function GiftBox({
  gift,
  positionX,
  rotationY,
  isOpen,
}: {
  gift: GiftDefinition;
  positionX: number;
  rotationY: number;
  isOpen: boolean;
}) {
  const polkaTexture = useMemo(() => {
    if (gift.pattern !== "polka") {
      return null;
    }

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.fillStyle = gift.baseColor;
    context.fillRect(0, 0, size, size);
    context.fillStyle = gift.accentColor;
    const radius = size / 10;

    for (let y = radius; y < size; y += radius * 3) {
      for (let x = radius; x < size; x += radius * 3) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    return texture;
  }, [gift.accentColor, gift.baseColor, gift.pattern]);

  useEffect(() => () => polkaTexture?.dispose(), [polkaTexture]);

  const [hovered, setHovered] = useState(false);

  const springs = useSpring({
    positionX,
    rotationY,
    scale: hovered ? 1.05 : 1,
    lidRotation: isOpen ? -Math.PI / 1.8 : 0,
    prizeY: isOpen ? 1.4 : 0.6,
    prizeScale: isOpen ? 1 : 0,
    config: {
      tension: 220,
      friction: 22,
    },
  });
  const lidHalfDepth = 1.9 / 2;

  const shouldFloatPrize = isOpen && gift.id !== "blue";
  const prizeContent = (() => {
    if (gift.id === "blue") {
      return <ToyMagicWand />;
    }
    if (gift.id === "polka") {
      return <ToyBoat floating={shouldFloatPrize} />;
    }
    if (gift.id === "green") {
      return <ToyRocket floating={shouldFloatPrize} />;
    }
    if (gift.id === "red") {
      return <ToyRobot floating={shouldFloatPrize} />;
    }
    return <AnimatedPrizeGem color={gift.prizeColor} label={gift.prizeLabel} floating={shouldFloatPrize} />;
  })();

  return (
    <a.group
      position-x={springs.positionX}
      rotation-y={springs.rotationY}
      position-y={0}
      scale={springs.scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group position-y={0.4}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.2, 1.8]} />
          <meshStandardMaterial
            color={gift.baseColor}
            map={polkaTexture ?? undefined}
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[1.9, 0.08, 0.3]} />
          <meshStandardMaterial color={gift.ribbonColor} roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.9, 0.08, 0.3]} />
          <meshStandardMaterial color={gift.ribbonColor} roughness={0.2} metalness={0.3} />
        </mesh>
      </group>

      <a.group position-y={1.0} position-z={-lidHalfDepth} rotation-x={springs.lidRotation}>
        <mesh position-z={lidHalfDepth} castShadow>
          <boxGeometry args={[1.9, 0.35, 1.9]} />
          <meshStandardMaterial color={gift.baseColor} map={polkaTexture ?? undefined} roughness={0.28} />
        </mesh>
      </a.group>

      <a.group position-y={springs.prizeY} scale={springs.prizeScale}>
        {prizeContent}
      </a.group>
    </a.group>
  );
}

function ResponsiveCamera({ width, height }: { width: number; height: number }) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!width || !height) {
      return;
    }
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    const isNarrow = width < 640;

    camera.aspect = width / height;
    camera.fov = isNarrow ? 62 : 54;
    camera.position.set(0, isNarrow ? 4.6 : 4.2, isNarrow ? 11.5 : 10.2);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}

export function GiftPlayground({ gifts, prompts }: GiftPlaygroundProps) {
  const { tolerance } = useSpeechSettings();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const slotWidth = containerWidth > 0 && gifts.length > 0 ? containerWidth / gifts.length : 0;
  const percentPerSlot = gifts.length > 0 ? 100 / gifts.length : 0;

  const [order, setOrder] = useState(() => gifts.map((gift) => gift.id));
  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const [dragFractions, setDragFractions] = useState<FractionMap>({});
  const [rotations, setRotations] = useState<RotationMap>(() => Object.fromEntries(gifts.map((gift) => [gift.id, 0])));
  const [openGiftId, setOpenGiftId] = useState<string | null>(null);
  const [lastPromptId, setLastPromptId] = useState<string | null>(null);

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
    resetTranscript,
  } = useSpeechRecognition();

  const listeningOptions = useMemo(
    () => ({
      language: "en-US",
      ...(browserSupportsContinuousListening ? { continuous: true } : {}),
    }),
    [browserSupportsContinuousListening],
  );

  const statusMessage = useMemo(() => {
    if (!browserSupportsSpeechRecognition) {
      return "Speech recognition is not available in this browser.";
    }
    if (!isMicrophoneAvailable) {
      return "Microphone access is blocked. Check your browser settings and try again.";
    }
    return listening ? "Listening for the magic words." : "Tap restart if you want to try again.";
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, listening]);

  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ width, height });
  }, []);

  useEffect(() => {
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => {
      window.removeEventListener("resize", updateContainerSize);
    };
  }, [updateContainerSize]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;

    SpeechRecognition.startListening(listeningOptions).catch(() => {
      /* silent */
    });

    return () => {
      SpeechRecognition.stopListening().catch(() => {
        /* silent */
      });
    };
  }, [browserSupportsSpeechRecognition, listeningOptions]);

  const giftById = useMemo(() => Object.fromEntries(gifts.map((gift) => [gift.id, gift] as const)), [gifts]);

  const basePositions = useMemo(() => {
    const half = (gifts.length - 1) / 2;
    const positions: Record<string, number> = {};

    order.forEach((giftId, index) => {
      positions[giftId] = (index - half) * BOX_SPACING;
    });

    return positions;
  }, [gifts.length, order]);

  useEffect(() => {
    if (!transcript) return;

    for (const prompt of prompts) {
      if (!phrasesMatch(transcript, prompt.phraseVariants, tolerance)) {
        continue;
      }

      let targetId: string | null = null;

      if (prompt.target.type === "gift") {
        targetId = prompt.target.giftId;
      } else if (prompt.target.type === "first") {
        targetId = orderRef.current[0] ?? null;
      } else if (prompt.target.type === "last") {
        const currentOrder = orderRef.current;
        targetId = currentOrder[currentOrder.length - 1] ?? null;
      }

      if (!targetId) {
        continue;
      }

      setOpenGiftId(targetId);
      setLastPromptId(prompt.id);
      resetTranscript();
      return;
    }
  }, [prompts, resetTranscript, tolerance, transcript]);

  const bindGift = useDrag(
    ({ args: [giftId], active, movement: [mx], touches }) => {
      if (!slotWidth) return;

      if (touches >= 2) {
        setRotations((prev) => ({
          ...prev,
          [giftId]: (prev[giftId] ?? 0) + mx * 0.01,
        }));
        setDragFractions((prev) => ({ ...prev, [giftId]: 0 }));
        return;
      }

      const currentOrder = orderRef.current;
      const currentIndex = currentOrder.indexOf(giftId);
      if (currentIndex === -1) return;

      let deltaIndex = mx / slotWidth;

      if (currentIndex === 0 && deltaIndex < 0) {
        deltaIndex = 0;
      } else if (currentIndex === gifts.length - 1 && deltaIndex > 0) {
        deltaIndex = 0;
      }

      if (active) {
        setDragFractions((prev) => ({
          ...prev,
          [giftId]: deltaIndex,
        }));

        const tentativeIndex = clamp(
          Math.round(currentIndex + deltaIndex),
          0,
          gifts.length - 1,
        );

        if (tentativeIndex !== currentIndex) {
          setOrder((prev) => {
            const previousIndex = prev.indexOf(giftId);
            if (previousIndex === -1 || previousIndex === tentativeIndex) {
              return prev;
            }
            return reorderList(prev, previousIndex, tentativeIndex);
          });
        }
      } else {
        setDragFractions((prev) => ({
          ...prev,
          [giftId]: 0,
        }));
      }
  },
  {
    pointer: { touch: true },
    axis: "x",
  },
);

  return (
    <div className="flex w-full flex-col items-center gap-10 -mt-12">
      <div className="relative w-full max-w-5xl">
        <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[conic-gradient(from_200deg,rgba(94,231,223,0.18),rgba(240,147,251,0.2),rgba(245,87,108,0.18),rgba(94,231,223,0.18))] blur-3xl" aria-hidden />
                <div
          id="gift-stage"
          ref={containerRef}
          className="relative h-[60vh] min-h-[360px]"
        >
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.toneMapping = THREE.NoToneMapping;
            }}
            camera={{ position: [0, 4.2, 10.2], fov: 54 }}
            style={{ background: "transparent" }}
          >
          <ResponsiveCamera width={containerWidth} height={containerHeight} />
          <ambientLight intensity={0.65} />
            <directionalLight
              position={[5, 8, 4]}
              intensity={1.1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <group position-y={-0.6}>
              {order.map((giftId) => {
                const gift = giftById[giftId];
                if (!gift) return null;
                const fraction = dragFractions[giftId] ?? 0;
                const positionX = basePositions[giftId] + fraction * BOX_SPACING;
                const rotationY = rotations[giftId] ?? 0;

                return (
                  <GiftBox
                    key={gift.id}
                    gift={gift}
                    positionX={positionX}
                    rotationY={rotationY}
                    isOpen={openGiftId === gift.id}
                  />
                );
              })}
            </group>
            <ContactShadows position={[0, -0.7, 0]} opacity={0.18} scale={12} blur={2.8} far={10} color="#000000" />
            <Environment preset="sunset" background={false} />
          </Canvas>
          <div className="pointer-events-none absolute inset-0">
            {order.map((giftId, index) => {
              const fraction = dragFractions[giftId] ?? 0;
              return (
                <div
                  key={giftId}
                  className="pointer-events-auto absolute top-0 h-full"
                  style={{
                    width: `${percentPerSlot}%`,
                    left: `${index * percentPerSlot}%`,
                    transform: `translateX(${fraction * percentPerSlot}%)`,
                  }}
                  {...bindGift(giftId)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl rounded-[24px] border-2 border-transparent bg-white bg-clip-padding p-1 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="rounded-[20px] bg-white px-6 py-8">
          <h2 className="text-lg font-semibold text-purple-900">Say it like this</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {prompts.map((prompt) => (
              <AudioPromptButton key={prompt.id} label={prompt.label} src={prompt.audio} />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <p className="bg-gradient-to-r from-[#f093fb] to-[#f5576c] bg-clip-text text-sm font-semibold text-transparent md:text-base">
              {statusMessage}
            </p>
            {transcript ? (
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 shadow-inner">
                {transcript}
              </p>
            ) : (
              <p className="text-sm text-slate-600">We will show what we hear right here.</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="ghost"
                className="h-12 rounded-full !bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] px-6 text-base font-semibold text-white shadow-md transition hover:brightness-110"
                onClick={() => {
                  resetTranscript();
                  SpeechRecognition.startListening(listeningOptions).catch(() => {});
                }}
              >
                Restart listening
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-full border border-slate-200 bg-white px-6 text-base font-semibold text-purple-800 shadow-md transition hover:shadow-lg"
                onClick={() => setOpenGiftId(null)}
              >
                Close gifts
              </Button>
            </div>
            {lastPromptId ? (
              <p className="text-xs font-semibold text-purple-700">
                Last heard: {prompts.find((prompt) => prompt.id === lastPromptId)?.label ?? ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}














