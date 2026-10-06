// ═══════════════════════════════════════════════════
// 🧠 Smart FAQ Assistant — Knowledge Base
// ═══════════════════════════════════════════════════
// Keyword lists for intent detection, spanning all 7
// supported languages. A user typing in ANY language
// matches the correct intent.

export type IntentKey =
  | "hours"
  | "location"
  | "parking"
  | "reservation"
  | "cancel"
  | "menu"
  | "allergies"
  | "vegetarian"
  | "halal"
  | "events";

// ═══════════════════════════════════════════════════
// Order matters: when two intents tie on score, the
// first one declared in this object wins. This list
// goes from MOST SPECIFIC (cancel, dietary needs) to
// MOST GENERAL (reservation, menu). Specific intents
// always beat broader topics on ambiguous queries.
// ═══════════════════════════════════════════════════
export const INTENT_KEYWORDS: Record<IntentKey, string[]> = {
  cancel: [
    "cancel", "cancellation", "modify", "change my", "reschedule",
    "الغاء", "الغيت", "الغي", "تعديل", "اغير", "ااجل",
    "annuler", "annulation", "modifier", "changer",
    "stornieren", "stornierung", "andern", "verschieben",
    "cancelar", "cancelacion", "cambiar", "modificar",
    "annullare", "annullamento", "cambiare", "modificare",
    "取消", "改期", "修改",
  ],
  allergies: [
    "allergy", "allergies", "allergic", "gluten", "nuts", "intolerant",
    "حساسيه", "حساس", "جلوتين", "مكسرات", "تحسس",
    "allergie", "allergique", "fruits a coque",
    "allergisch", "nusse",
    "alergia", "alergias", "alergico", "frutos secos",
    "allergia", "allergie", "allergico", "glutine", "frutta secca",
    "过敏", "过敏原", "麸质", "坚果",
  ],
  halal: [
    "halal", "islamic", "pork", "alcohol",
    "حلال", "حلاله", "خنزير", "كحول",
    "porc", "alcool",
    "schweinefleisch", "alkohol",
    "cerdo", "alcohol",
    "maiale", "alcol",
    "清真", "猪肉",
  ],
  vegetarian: [
    "vegetarian", "vegetarians", "vegan", "vegans", "veggie",
    "plant based", "no meat",
    "نباتي", "نباتيه", "فيغان", "بدون لحوم", "خضار",
    "vegetarien", "vegetarienne", "vegetariens", "vegetariennes",
    "vegetalien", "vegetalienne", "vegetaliens", "vegetaliennes",
    "vegane", "veganes", "sans viande",
    "vegetarisch", "vegetarische", "vegan", "vegane", "ohne fleisch",
    "vegetariano", "vegetarianos", "vegetariana", "vegetarianas",
    "vegano", "veganos", "vegana", "veganas", "sin carne",
    "vegetariano", "vegetariani", "vegetariana", "vegetariane",
    "vegano", "vegani", "vegana", "vegane", "senza carne",
    "素食", "纯素", "不吃肉",
  ],
  events: [
    "event", "events", "party", "birthday", "wedding", "group", "large party", "private",
    "مناسبه", "حفله", "عيد ميلاد", "زفاف", "فرح", "مجموعه", "مناسبات", "خاص",
    "evenement", "fete", "anniversaire", "mariage", "groupe", "prive",
    "veranstaltung", "feier", "geburtstag", "hochzeit", "gruppe", "privat",
    "evento", "fiesta", "cumpleanos", "boda", "grupo", "privado",
    "evento", "festa", "compleanno", "matrimonio", "gruppo", "privato",
    "活动", "派对", "生日", "婚礼", "聚会", "团体", "包场",
  ],
  parking: [
    "parking", "park", "car", "vehicle",
    "موقف", "مواقف", "سياره", "بارك", "باركينج",
    "voiture", "stationnement", "garer",
    "parkplatz", "parken", "auto", "wagen",
    "estacionamiento", "aparcamiento", "coche",
    "parcheggio", "parcheggiare", "macchina",
    "停车", "车位",
  ],
  location: [
    "location", "address", "where", "find you", "directions", "map",
    "موقع", "عنوان", "اين", "خريطه", "اتجاهات", "مكان",
    "emplacement", "adresse", "ou", "carte", "direction",
    "standort", "adresse", "wo", "karte", "richtung",
    "ubicacion", "direccion", "donde", "mapa",
    "posizione", "indirizzo", "dove", "mappa",
    "地址", "位置", "哪里", "地图", "怎么走",
  ],
  hours: [
    "hours", "open", "close", "opening", "closing", "what time",
    "ساعات", "مفتوح", "يفتح", "يغلق", "متى", "مواعيد",
    "horaires", "ouvert", "ferme", "ouverture", "fermeture", "quand",
    "offnungszeiten", "offen", "geschlossen", "wann", "uhrzeit",
    "horario", "abierto", "cerrado", "cuando", "hora",
    "orari", "aperto", "chiuso", "quando", "ora",
    "时间", "营业", "开门", "关门", "几点",
  ],
  reservation: [
    "reserve", "reservation", "book", "booking", "table for",
    "حجز", "احجز", "طاوله", "نحجز",
    "reserver", "reservation", "reserv",
    "reservieren", "reservierung", "buchen", "tisch",
    "reservar", "reserva", "mesa",
    "prenotare", "prenotazione", "prenota", "tavolo",
    "预订", "订位", "订桌", "桌子",
  ],
  menu: [
    "menu", "dishes", "food", "eat", "cuisine",
    "قائمه", "منيو", "اكل", "طبق", "ماكولات",
    "plats", "nourriture", "manger",
    "speisekarte", "menu", "gerichte", "essen",
    "platos", "comida", "comer",
    "piatti", "cibo", "mangiare",
    "菜单", "菜品", "吃什么",
  ],
};