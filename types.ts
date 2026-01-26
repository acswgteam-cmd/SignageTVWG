export interface SignageData {
  id: string;
  createdAt: number;
  welcomeLabel: string;
  guestName: string;
  subText: string;
  backgroundImage?: string;
}

export const DEFAULT_DATA: Omit<SignageData, 'id' | 'createdAt'> = {
  welcomeLabel: "WELCOME",
  guestName: "Tamu Undangan",
  subText: ""
};