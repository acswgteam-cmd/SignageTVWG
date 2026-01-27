export interface Signage {
  id: string; // uuid
  created_at: string;
  welcome_label: string;
  guest_name: string;
  sub_text: string;
  background_image: string | null;
  is_active?: boolean;
  layout?: 'landscape' | 'portrait'; // New field
}

export interface SavedBackground {
  id: string;
  created_at: string;
  image_data: string;
}

export type SignageInsert = Omit<Signage, 'id' | 'created_at'>;
export type SignageUpdate = Partial<SignageInsert>;
