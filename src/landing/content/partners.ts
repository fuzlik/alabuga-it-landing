export const PARTNERS = [
  "татнефть",
  "AURUS",
  "Белая Дача Алабуга",
  "Алабуга-Волокно",
  "Джошкуноз Алабуга",
  "Хаят Кимья",
] as const;

export type PartnerName = (typeof PARTNERS)[number];
