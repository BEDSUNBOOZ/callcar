export type Profile = {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  status: "active" | "suspended";
  notify_email: boolean;
  retention_days: number;
  created_at: string;
};
export type Vehicle = { id: string; owner_id: string; label: string; plate: string | null; active: boolean; created_at: string };
export type QrToken = { id: string; vehicle_id: string; token: string; status: "active" | "revoked"; created_at: string };
export type Message = {
  id: string;
  vehicle_id: string;
  reason: string;
  body: string;
  read_at: string | null;
  owner_reply: string | null;
  replied_at: string | null;
  flagged: boolean;
  created_at: string;
};
