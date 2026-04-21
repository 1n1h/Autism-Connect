export type ResourceType = "therapy" | "school" | "doctor" | "nonprofit";

export type Resource = {
  id: string;
  name: string;
  description: string | null;
  resource_type: ResourceType | string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  accepts_insurance: boolean | null;
  specializations: string[] | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

/** Filter state synced to URL query params. */
export type ResourceFilters = {
  search: string;
  type: ResourceType | "all";
  city: string | "all";
  specialization: string | "all";
  insuranceOnly: boolean;
};

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "therapy", label: "Therapy" },
  { value: "school", label: "School" },
  { value: "doctor", label: "Doctor / Diagnostic" },
  { value: "nonprofit", label: "Nonprofit / Support" },
];

export function humanizeSpecialization(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
