// قائمة الأطباق مع ربطها بالتصنيفات عبر categorySlug
export const menuItems = [
  // ─── مقبلات ───
  {
    name: 'شوربة العدس',
    slug: 'lentil-soup',
    description: 'شوربة عدس تقليدية مع الكمون والليمون',
    price: 45,
    isFeatured: false,
    categorySlug: 'appetizers',
  },
  {
    name: 'حمص بالطحينة',
    slug: 'hummus',
    description: 'حمص كريمي مع زيت الزيتون والصنوبر',
    price: 55,
    isFeatured: true,
    categorySlug: 'appetizers',
  },
  {
    name: 'متبل الباذنجان',
    slug: 'baba-ghanoush',
    description: 'باذنجان مشوي مع الطحينة والثوم',
    price: 50,
    isFeatured: false,
    categorySlug: 'appetizers',
  },

  // ─── أطباق رئيسية ───
  {
    name: 'كباب حلبي',
    slug: 'aleppo-kebab',
    description: 'كباب لحم مشوي مع أرز بالشعرية',
    price: 180,
    isFeatured: true,
    categorySlug: 'main-courses',
  },
  {
    name: 'ملوخية بالدجاج',
    slug: 'molokhia-chicken',
    description: 'ملوخية خضراء مع دجاج مشوي وأرز',
    price: 140,
    isFeatured: false,
    categorySlug: 'main-courses',
  },
  {
    name: 'مسقعة بالباذنجان',
    slug: 'moussaka',
    description: 'طبقات باذنجان ولحم مفروم بصلصة الطماطم',
    price: 130,
    isFeatured: false,
    categorySlug: 'main-courses',
  },

  // ─── حلويات ───
  {
    name: 'كنافة بالجبن',
    slug: 'knafeh',
    description: 'كنافة ذهبية محشوة بالجبن مع القطر',
    price: 70,
    isFeatured: true,
    categorySlug: 'desserts',
  },
  {
    name: 'أم علي',
    slug: 'om-ali',
    description: 'حلوى مصرية بالحليب والمكسرات',
    price: 65,
    isFeatured: false,
    categorySlug: 'desserts',
  },
  {
    name: 'بسبوسة بالقشطة',
    slug: 'basbousa',
    description: 'بسبوسة طرية محشوة بالقشطة',
    price: 60,
    isFeatured: false,
    categorySlug: 'desserts',
  },

  // ─── مشروبات ───
  {
    name: 'عصير ليمون بالنعناع',
    slug: 'lemon-mint',
    description: 'ليمون طازج مع نعناع مثلج',
    price: 35,
    isFeatured: false,
    categorySlug: 'beverages',
  },
  {
    name: 'شاي مغربي',
    slug: 'moroccan-tea',
    description: 'شاي أخضر بالنعناع في كوب تقليدي',
    price: 30,
    isFeatured: false,
    categorySlug: 'beverages',
  },
  {
    name: 'قهوة عربية',
    slug: 'arabic-coffee',
    description: 'قهوة عربية بالهيل والزعفران',
    price: 40,
    isFeatured: true,
    categorySlug: 'beverages',
  },
]