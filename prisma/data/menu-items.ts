// قائمة الأطباق مع ربطها بالتصنيفات عبر categorySlug
// الصور من Unsplash — مجانية للاستخدام التجاري
export const menuItems = [
  // ─── مقبلات ───
  {
    name: "شوربة العدس",
    slug: "lentil-soup",
    description: "شوربة عدس تقليدية مع الكمون والليمون",
    price: 45,
    isFeatured: false,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "حمص بالطحينة",
    slug: "hummus",
    description: "حمص كريمي مع زيت الزيتون والصنوبر",
    price: 55,
    isFeatured: true,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "متبل الباذنجان",
    slug: "baba-ghanoush",
    description: "باذنجان مشوي مع الطحينة والثوم",
    price: 50,
    isFeatured: false,
    categorySlug: "appetizers",
    imageUrl:
      "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&h=600&fit=crop&q=80",
  },

  // ─── أطباق رئيسية ───
  {
    name: "كباب حلبي",
    slug: "aleppo-kebab",
    description: "كباب لحم مشوي مع أرز بالشعرية",
    price: 180,
    isFeatured: true,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "ملوخية بالدجاج",
    slug: "molokhia-chicken",
    description: "ملوخية خضراء مع دجاج مشوي وأرز",
    price: 140,
    isFeatured: false,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "مسقعة بالباذنجان",
    slug: "moussaka",
    description: "طبقات باذنجان ولحم مفروم بصلصة الطماطم",
    price: 130,
    isFeatured: false,
    categorySlug: "main-courses",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop&q=80",
  },

  // ─── حلويات ───
  {
    name: "كنافة بالجبن",
    slug: "knafeh",
    description: "كنافة ذهبية محشوة بالجبن مع القطر",
    price: 70,
    isFeatured: true,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "أم علي",
    slug: "om-ali",
    description: "حلوى مصرية بالحليب والمكسرات",
    price: 65,
    isFeatured: false,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "بسبوسة بالقشطة",
    slug: "basbousa",
    description: "بسبوسة طرية محشوة بالقشطة",
    price: 60,
    isFeatured: false,
    categorySlug: "desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800&h=600&fit=crop&q=80",
  },

  // ─── مشروبات ───
  {
    name: "عصير ليمون بالنعناع",
    slug: "lemon-mint",
    description: "ليمون طازج مع نعناع مثلج",
    price: 35,
    isFeatured: false,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "شاي مغربي",
    slug: "moroccan-tea",
    description: "شاي أخضر بالنعناع في كوب تقليدي",
    price: 30,
    isFeatured: false,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "قهوة عربية",
    slug: "arabic-coffee",
    description: "قهوة عربية بالهيل والزعفران",
    price: 40,
    isFeatured: true,
    categorySlug: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop&q=80",
  },
];