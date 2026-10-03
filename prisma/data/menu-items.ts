// Menu items with bilingual names (Arabic + English)
// English fields are shown in all non-Arabic locales as fallback.
export const menuItems = [
  // ─── مقبلات / Appetizers ───
  {
    name: "شوربة العدس",
    nameEn: "Lentil Soup",
    slug: "lentil-soup",
    description: "شوربة عدس تقليدية مع الكمون والليمون",
    descriptionEn: "Traditional lentil soup with cumin and lemon",
    price: 45,
    isFeatured: false,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "حمص بالطحينة",
    nameEn: "Hummus with Tahini",
    slug: "hummus",
    description: "حمص كريمي مع زيت الزيتون والصنوبر",
    descriptionEn: "Creamy hummus with olive oil and pine nuts",
    price: 55,
    isFeatured: true,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "متبل الباذنجان",
    nameEn: "Baba Ghanoush",
    slug: "baba-ghanoush",
    description: "باذنجان مشوي مع الطحينة والثوم",
    descriptionEn: "Grilled eggplant with tahini and garlic",
    price: 50,
    isFeatured: false,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&h=600&fit=crop&q=80",
  },

  // ─── أطباق رئيسية / Main Courses ───
  {
    name: "كباب حلبي",
    nameEn: "Aleppo Kebab",
    slug: "aleppo-kebab",
    description: "كباب لحم مشوي مع أرز بالشعرية",
    descriptionEn: "Grilled meat kebab served with vermicelli rice",
    price: 180,
    isFeatured: true,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "ملوخية بالدجاج",
    nameEn: "Molokhia with Chicken",
    slug: "molokhia-chicken",
    description: "ملوخية خضراء مع دجاج مشوي وأرز",
    descriptionEn: "Green molokhia stew with grilled chicken and rice",
    price: 140,
    isFeatured: false,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "مسقعة بالباذنجان",
    nameEn: "Moussaka",
    slug: "moussaka",
    description: "طبقات باذنجان ولحم مفروم بصلصة الطماطم",
    descriptionEn: "Layers of eggplant and minced meat in tomato sauce",
    price: 130,
    isFeatured: false,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop&q=80",
  },

  // ─── حلويات / Desserts ───
  {
    name: "كنافة بالجبن",
    nameEn: "Cheese Knafeh",
    slug: "knafeh",
    description: "كنافة ذهبية محشوة بالجبن مع القطر",
    descriptionEn: "Golden knafeh stuffed with cheese and drizzled with syrup",
    price: 70,
    isFeatured: true,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "أم علي",
    nameEn: "Om Ali",
    slug: "om-ali",
    description: "حلوى مصرية بالحليب والمكسرات",
    descriptionEn: "Traditional Egyptian dessert with milk and mixed nuts",
    price: 65,
    isFeatured: false,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "بسبوسة بالقشطة",
    nameEn: "Basbousa with Cream",
    slug: "basbousa",
    description: "بسبوسة طرية محشوة بالقشطة",
    descriptionEn: "Tender basbousa stuffed with rich cream",
    price: 60,
    isFeatured: false,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800&h=600&fit=crop&q=80",
  },

  // ─── مشروبات / Beverages ───
  {
    name: "عصير ليمون بالنعناع",
    nameEn: "Lemon Mint Juice",
    slug: "lemon-mint",
    description: "ليمون طازج مع نعناع مثلج",
    descriptionEn: "Fresh lemon juice with iced mint",
    price: 35,
    isFeatured: false,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "شاي مغربي",
    nameEn: "Moroccan Tea",
    slug: "moroccan-tea",
    description: "شاي أخضر بالنعناع في كوب تقليدي",
    descriptionEn: "Green tea with fresh mint served in a traditional glass",
    price: 30,
    isFeatured: false,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "قهوة عربية",
    nameEn: "Arabic Coffee",
    slug: "arabic-coffee",
    description: "قهوة عربية بالهيل والزعفران",
    descriptionEn: "Arabic coffee with cardamom and saffron",
    price: 40,
    isFeatured: true,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop&q=80",
  },
];