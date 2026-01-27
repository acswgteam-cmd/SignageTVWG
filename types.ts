export interface Signage {
  id: string; // uuid
  created_at: string;
  welcome_label: string;
  guest_name: string;
  sub_text: string;
  background_image: string | null;
  is_active?: boolean; // New field for TV playlist
}

export type SignageInsert = Omit<Signage, 'id' | 'created_at'>;
export type SignageUpdate = Partial<SignageInsert>;
