export const COUNTRIES = [
  { code: "EG", name: "Egypt" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export interface Governorate {
  code: string;
  name: string;
  nameAr: string;
}

export const GOVERNORATES: Governorate[] = [
  { code: "ALX", name: "Alexandria", nameAr: "الإسكندرية" },
  { code: "ASN", name: "Aswan", nameAr: "أسوان" },
  { code: "ASY", name: "Asyut", nameAr: "أسيوط" },
  { code: "BHR", name: "Beheira", nameAr: "البحيرة" },
  { code: "BNS", name: "Beni Suef", nameAr: "بني سويف" },
  { code: "CAI", name: "Cairo", nameAr: "القاهرة" },
  { code: "DKH", name: "Dakahlia", nameAr: "الدقهلية" },
  { code: "DMY", name: "Damietta", nameAr: "دمياط" },
  { code: "FYM", name: "Faiyum", nameAr: "الفيوم" },
  { code: "GHB", name: "Gharbia", nameAr: "الغربية" },
  { code: "GZH", name: "Giza", nameAr: "الجيزة" },
  { code: "ISM", name: "Ismailia", nameAr: "الإسماعيلية" },
  { code: "KFR", name: "Kafr el-Sheikh", nameAr: "كفر الشيخ" },
  { code: "LXR", name: "Luxor", nameAr: "الأقصر" },
  { code: "MTR", name: "Matruh", nameAr: "مطروح" },
  { code: "MNY", name: "Minya", nameAr: "المنيا" },
  { code: "MNF", name: "Monufia", nameAr: "المنوفية" },
  { code: "NBR", name: "New Valley", nameAr: "الوادي الجديد" },
  { code: "NSD", name: "North Sinai", nameAr: "شمال سيناء" },
  { code: "PSD", name: "Port Said", nameAr: "بور سعيد" },
  { code: "QLB", name: "Qalyubia", nameAr: "القليوبية" },
  { code: "QNA", name: "Qena", nameAr: "قنا" },
  { code: "RED", name: "Red Sea", nameAr: "البحر الأحمر" },
  { code: "SHR", name: "Sharqia", nameAr: "الشرقية" },
  { code: "SHZ", name: "Sohag", nameAr: "سوهاج" },
  { code: "SSD", name: "South Sinai", nameAr: "جنوب سيناء" },
  { code: "SUZ", name: "Suez", nameAr: "السويس" },
];

export const CITIES_BY_GOVERNORATE: Record<string, string[]> = {
  CAI: ["Cairo (City Center)", "Nasr City", "Heliopolis", "Maadi", "Zamalek", "New Cairo", "6th of October", "Shubra", "Ain Shams", "Mokattam"],
  GZH: ["Giza (City Center)", "Dokki", "Agouza", "Haram", "Imbaba", "Sheikh Zayed", "6th of October City", "Badrashin", "Atfih"],
  ALX: ["Alexandria (City Center)", "Smouha", "Sidi Bishr", "Montaza", "Agami", "Borg El Arab", "Abu Qir", "Mex"],
  GHB: ["Tanta", "El Mahalla El Kubra", "Kafr El Zayat", "Zefta", "Samanoud", "Basyoun"],
  DKH: ["Mansoura", "Talkha", "Mit Ghamr", "Aga", "Dekernes", "Belqas", "Sherbin"],
  SHR: ["Zagazig", "10th of Ramadan", "Belbeis", "Minya Al Qamh", "Faqous", "Hihya"],
  QLB: ["Banha", "Shubra El Kheima", "Qalyub", "Tukh", "Khanka", "Shibin Al Qanatir"],
  MNF: ["Shibin El Kom", "Sadat City", "Menouf", "Tala", "Ashmoun", "Birket El Sab"],
  BHR: ["Damanhur", "Kafr El Dawwar", "Rosetta", "Desouk", "Abu Hummus", "Edku"],
  KFR: ["Kafr el-Sheikh", "Desouk", "Fuwwah", "El Hamoul", "Baltim", "Mutubas"],
  DMY: ["Damietta", "New Damietta", "Faraskur", "Kafr Saad"],
  ISM: ["Ismailia", "Fayed", "Qantara", "Abu Sweir"],
  PSD: ["Port Said"],
  SUZ: ["Suez", "Ain Sokhna", "Faysal"],
  ASY: ["Asyut", "Manfalut", "Abnoub", "El Qusiyya", "Sahel Selim", "Dayrut"],
  MNY: ["Minya", "Beni Mazar", "Matay", "Samalut", "Deir Mawas", "Abu Qurqas", "Malawi"],
  FYM: ["Faiyum", "Ibshaway", "Sinnuris", "Tamiyya", "Yusuf El Seddiq"],
  BNS: ["Beni Suef", "Nasser", "El Fashn", "Ehnasia", "Sumusta"],
  QNA: ["Qena", "Nag Hammadi", "Dishna", "Qus", "Luxor (North)"],
  LXR: ["Luxor", "Armant", "Esna", "Qurna"],
  ASN: ["Aswan", "Edfu", "Kom Ombo", "Abu Simbel", "Daraw"],
  SHZ: ["Sohag", "Akhmim", "Tahta", "Girga", "Juhaina"],
  NSD: ["Arish", "Rafah", "Sheikh Zuweid", "Bir al-Abd"],
  SSD: ["El Tor", "Sharm El Sheikh", "Dahab", "Nuweiba", "Taba"],
  MTR: ["Marsa Matruh", "Siwa", "Sidi Barrani", "Salum"],
  RED: ["Hurghada", "Safaga", "El Quseir", "Marsa Alam", "Shalateen"],
  NBR: ["Kharga", "Dakhla", "Farafra", "Bahariya"],
};

export function getCitiesForGovernorate(govCode: string): string[] {
  return CITIES_BY_GOVERNORATE[govCode] ?? [];
}
