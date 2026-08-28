const OFFICE_ADDRESS =
  "ОЭЗ Алабуга, улица Ш-2, 4/1, Елабуга, Республика Татарстан";

export const OFFICE_MAPS_URL =
  import.meta.env.VITE_OFFICE_MAPS_URL?.trim() ||
  `https://yandex.ru/maps/?text=${encodeURIComponent(OFFICE_ADDRESS)}`;

export const OFFICE_MAPS_LABEL =
  "Офис: Республика Татарстан, г.Елабуга, ОЭЗ, улица Ш-2, 4/1";
