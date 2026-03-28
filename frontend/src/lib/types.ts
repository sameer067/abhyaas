export interface ComplianceBlock {
  overall: number;
  workout: number;
  diet: number;
}

export interface ClientSummary {
  id: string;
  name: string;
  phone: string | null;
  magic_link: string;
  c7d: ComplianceBlock;
  c14d: ComplianceBlock;
  c30d: ComplianceBlock;
  c_all: ComplianceBlock;
  c_custom: ComplianceBlock | null;
  goal: string | null;
  weight_kg: number | null;
  height_feet: number | null;
  status: string;
  last_checkin: string | null;
  streak: number;
  created_at: string;
}
