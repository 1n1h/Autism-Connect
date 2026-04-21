export type BlogCategory =
  | "education"
  | "therapy"
  | "community"
  | "legal"
  | "family_life"
  | "resources"
  | "other";

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; accent: string }[] = [
  { value: "education", label: "Education & IEPs", accent: "bg-teal-100 text-teal-600" },
  { value: "therapy", label: "Therapy", accent: "bg-coral-100 text-coral-600" },
  { value: "community", label: "Community", accent: "bg-lavender-100 text-lavender-400" },
  { value: "legal", label: "Legal & Benefits", accent: "bg-sunny-200 text-plum-900" },
  { value: "family_life", label: "Family life", accent: "bg-coral-100 text-coral-600" },
  { value: "resources", label: "Resources", accent: "bg-teal-100 text-teal-600" },
  { value: "other", label: "Other", accent: "bg-plum-800/5 text-plum-800/70" },
];

export type BlogAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  state: string | null;
  profile_photo_url: string | null;
};

export type BlogPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: BlogCategory | string | null;
  views: number;
  created_at: string;
  updated_at: string;
  author?: BlogAuthor | null;
  comment_count?: number;
};

export type BlogComment = {
  id: string;
  blog_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: BlogAuthor | null;
};

export function categoryLabel(slug: string | null | undefined): string {
  if (!slug) return "Other";
  const hit = BLOG_CATEGORIES.find((c) => c.value === slug);
  return hit?.label ?? slug;
}

export function categoryAccent(slug: string | null | undefined): string {
  const hit = BLOG_CATEGORIES.find((c) => c.value === slug);
  return hit?.accent ?? "bg-plum-800/5 text-plum-800/70";
}
