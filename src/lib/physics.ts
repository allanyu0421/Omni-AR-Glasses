export enum Material {
  Titanium = "Titanium Gr5",
  Aluminum = "Aluminum 7075-T6",
  ABS = "ABS Polycarbonate",
}

export const MATERIAL_THRESHOLDS: Record<Material, number> = {
  [Material.Titanium]: 800, // MPa
  [Material.Aluminum]: 250, // MPa
  [Material.ABS]: 40, // MPa
};

export type AnalysisStatus = "PASS" | "CRITICAL" | "FAIL";

export interface ForceResult {
  name: string;
  value: number; 
  unit: string;
  status: AnalysisStatus;
  threshold: number;
  description: string;
  mitigation: string;
}

export const GRAVITY = 9.81;

export function calculateAnalysis(
  mass: number,
  acceleration: number, // Using this as Impact factor (Sf)
  compressionLoad: number,
  bendingSF: number,
  material: Material
): ForceResult[] {
  const yieldStrength = MATERIAL_THRESHOLDS[material];

  // Structural Constants calibrated for the OmniScene Pro (Bulky Headset Geometry)
  // Brow bar and temples are much thicker than standard glasses
  const determineStatus = (val: number, limit: number): AnalysisStatus => {
    const ratio = val / limit;
    if (ratio >= 1.0) return "FAIL";
    if (ratio >= 0.85) return "CRITICAL"; // Tighter tolerance for high-end gear
    return "PASS";
  };

  // 1. Tension (T) - Strap load (High sensitivity to Mass)
  const tensionStress = (mass * acceleration * 450); 
  
  // 2. Compression (C) - Brow bar static load
  const compressionStress = (compressionLoad * 1.8);

  // 3. Bending (B) - Temple leverage at the dial/hinge
  const bendingStress = (mass * 350 * bendingSF); 

  // 4. Shearing (S) - Dial mechanism pivot resistance
  const shearLimit = yieldStrength * 0.57;
  const shearStress = (mass * acceleration * 300);

  // 5. Torsion (Tor) - Brow bar twisting during single-hand removal
  const torsionLimit = yieldStrength * 0.5;
  const torsionStress = (mass * (mass * GRAVITY) * 1800);

  // 6. Fatigue (F) - Endurance limit
  const fatigueLimit = yieldStrength * 0.35; // Electronics heat lowers fatigue resistance
  const fatigueStress = tensionStress * 0.9;

  return [
    {
      name: "Strap Tension",
      value: tensionStress,
      unit: "MPa",
      threshold: yieldStrength,
      status: determineStatus(tensionStress, yieldStrength),
      description: "Axial load on rear adjustment strap and waveguide seals.",
      mitigation: "Increase strap cross-section or use Titanium Grade-5 reinforcement.",
    },
    {
      name: "Brow Compression",
      value: compressionStress,
      unit: "MPa",
      threshold: yieldStrength,
      status: determineStatus(compressionStress, yieldStrength),
      description: "Structural load on the upper brow-bar display housing.",
      mitigation: "Optimize waveguide stack internal support ribs.",
    },
    {
      name: "Temple Bending",
      value: bendingStress,
      unit: "MPa",
      threshold: yieldStrength,
      status: determineStatus(bendingStress, yieldStrength),
      description: "Lateral leverage at the dial-hinge junction points.",
      mitigation: "Taper temple thickness or switch to Aluminum-Lithium alloy.",
    },
    {
      name: "Dial Shearing",
      value: shearStress,
      unit: "MPa",
      threshold: shearLimit,
      status: determineStatus(shearStress, shearLimit),
      description: "Shear failure risk in the adjustment dial pivot screw.",
      mitigation: "Increase pivot pin diameter or utilize stainless steel core.",
    },
    {
      name: "Bar Torsion",
      value: torsionStress,
      unit: "MPa",
      threshold: torsionLimit,
      status: determineStatus(torsionStress, torsionLimit),
      description: "Twisting moment across the main nose-bridge architecture.",
      mitigation: "Integrate carbon-fiber torsional bracing in the nose-guard.",
    },
    {
      name: "Thermal Fatigue",
      value: fatigueStress,
      unit: "MPa",
      threshold: fatigueLimit,
      status: determineStatus(fatigueStress, fatigueLimit),
      description: "Heat-accelerated fatigue from Micro-Display dissipation.",
      mitigation: "Implement external heat-sink fins at temple junctions.",
    },
  ];
}
