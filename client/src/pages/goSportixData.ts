export type GoSport = "الكل" | "الجري" | "التدريب" | "كرة القدم" | "الأنشطة المائية";

export type GoActivity = {
  id: string;
  sport: Exclude<GoSport, "الكل">;
  title: string;
  partner: string;
  location: string;
  schedule: string;
  duration: string;
  distance: string;
  remainingPlaces: number;
  priceSar: number;
  visual: "run" | "train" | "football" | "water" | "recovery";
  note: string;
};

export const goSportFilters: GoSport[] = ["الكل", "الجري", "التدريب", "كرة القدم", "الأنشطة المائية"];

export const goActivities: GoActivity[] = [
  { id: "night-run", sport: "الجري", title: "جولة المدينة المسائية", partner: "GO SPORTIX RUN CLUB", location: "واجهة الرياض", schedule: "اليوم / 18:30", duration: "60 دقيقة", distance: "2.1 كم", remainingPlaces: 12, priceSar: 0, visual: "run", note: "جولة مجتمعية بإيقاع مفتوح للمشاركين من مختلف المستويات." },
  { id: "functional", sport: "التدريب", title: "قوة وحركة", partner: "STUDIO 07", location: "حي الملقا", schedule: "غداً / 19:00", duration: "45 دقيقة", distance: "3.8 كم", remainingPlaces: 6, priceSar: 35, visual: "train", note: "جلسة تدريب وظيفي قصيرة تركّز على الحركة، التحكم، وبناء الإيقاع." },
  { id: "pitch", sport: "كرة القدم", title: "الملعب المفتوح", partner: "SPORTIX FOOTBALL", location: "ملعب الشمال", schedule: "الجمعة / 20:30", duration: "90 دقيقة", distance: "5.4 كم", remainingPlaces: 8, priceSar: 25, visual: "football", note: "تجربة لعب منظمة للأفراد، مع تقسيم الفرق عند الوصول." },
  { id: "paddle", sport: "الأنشطة المائية", title: "إيقاع الماء", partner: "WATER PATH", location: "وادي نمار", schedule: "السبت / 07:00", duration: "75 دقيقة", distance: "8.2 كم", remainingPlaces: 10, priceSar: 55, visual: "water", note: "جلسة مائية صباحية للمبتدئين تتضمن التجهيز والتوجيه الأساسي." },
  { id: "mobility", sport: "التدريب", title: "استعادة الإيقاع", partner: "MOVE WELL", location: "حي الياسمين", schedule: "الأحد / 18:00", duration: "50 دقيقة", distance: "4.6 كم", remainingPlaces: 14, priceSar: 30, visual: "recovery", note: "تمدد وحركة موجهة لمساعدة الجسم على الاستعداد للجلسة التالية." },
];

export function filterGoActivities(activities: GoActivity[], sport: GoSport, query: string): GoActivity[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");
  return activities.filter((activity) => {
    const inSport = sport === "الكل" || activity.sport === sport;
    const searchable = `${activity.title} ${activity.partner} ${activity.location} ${activity.sport}`.toLocaleLowerCase("ar");
    return inSport && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

export function calculateBookingTotal(activity: GoActivity, attendees: number): number {
  return Math.max(0, attendees) * activity.priceSar;
}
