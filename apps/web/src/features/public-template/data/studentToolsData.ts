import { StudentToolCategory, StudentToolPreview } from '../types';

export const STUDENT_TOOL_CATEGORIES: StudentToolCategory[] = [
  'الكتابة والوثائق',
  'الإرشاد والتوجيه',
  'التخطيط الدراسي',
  'الحاسبات الأكاديمية',
  'القبول والجاهزية',
  'البحث والمقارنة',
  'التخطيط المالي',
  'التحقق من الوثائق',
];

/**
 * Update 22 intentionally exposes only two reference cards to validate the
 * public UX, filters, detail flow and contextual linking before the full
 * Phase 18 registry is connected to the public website.
 */
export const STUDENT_TOOLS_PREVIEW: StudentToolPreview[] = [
  {
    id: 'tool-university-comparison',
    toolKey: 'university-comparison',
    title: 'مقارنة الجامعات',
    titleEn: 'University Comparison',
    shortDescription:
      'قارن بين الجامعات جنبًا إلى جنب باستخدام بيانات منارتك الأساسية لتوضيح الفروقات قبل اتخاذ القرار.',
    category: 'البحث والمقارنة',
    executionLabel: 'بيانات ومقارنة',
    availability: 'متاحة الآن',
    estimatedTime: '2–5 دقائق',
    badge: 'أداة قرار',
    purpose:
      'مساعدتك على تنظيم المقارنة بين جامعتين أو أكثر دون إنشاء نسخ مكررة من بيانات الجامعات أو اختراع معلومات غير موجودة في السجل الأساسي.',
    howItWorks: [
      'تختار الجامعات من دليل الجامعات في منارتك.',
      'تقرأ الأداة الحقول المتاحة من السجلات الأساسية للجامعات.',
      'تعرض الفروقات في قالب موحّد يساعدك على اتخاذ القرار.',
    ],
    inputs: ['جامعتان أو أكثر من دليل الجامعات', 'معايير المقارنة التي تهمك'],
    outputs: ['مقارنة منظمة جنبًا إلى جنب', 'نقاط اختلاف واضحة تساعد في القرار'],
    notes: [
      'الأداة لا تغيّر بيانات الجامعة ولا تنشئ نسخة مستقلة منها.',
      'أي حقل غير موجود في بيانات الجامعة الأساسية لا يتم اختراعه داخل المقارنة.',
    ],
    contextualLinks: [
      {
        category: 'universities',
        label: 'اختيار الجامعات من الدليل',
        description: 'انتقل إلى دليل الجامعات ثم عد للأداة بعد تحديد الخيارات المناسبة.',
      },
    ],
    serviceSuggestions: [
      {
        serviceId: 'service-university-major-consultation',
        label: 'استشارة اختيار الجامعة والتخصص',
        note: 'اقتراح سياقي لمن يريد مساعدة بشرية أعمق بعد استخدام أداة المقارنة.',
      },
    ],
  },
  {
    id: 'tool-motivation-letter-generator',
    toolKey: 'motivation-letter-generator',
    title: 'مولّد خطاب الدافع',
    titleEn: 'Motivation Letter Generator',
    shortDescription:
      'أنشئ مسودة منظمة لخطاب الدافع انطلاقًا من معلوماتك وهدفك الدراسي، مع توضيح أن الناتج يحتاج مراجعتك قبل الاستخدام.',
    category: 'الكتابة والوثائق',
    executionLabel: 'أداة ذكية',
    availability: 'متاحة الآن',
    estimatedTime: '3–7 دقائق',
    badge: 'AI عبر Phase 17',
    purpose:
      'مساعدة الطالب في تحويل معلوماته الأكاديمية وأهدافه إلى مسودة أولية منظمة يمكنه مراجعتها وتخصيصها لكل طلب.',
    howItWorks: [
      'تدخل هدفك الدراسي والجهة أو الفرصة المستهدفة ومعلوماتك الأساسية.',
      'Phase 18 يجمع البيانات المطلوبة فقط ويطلب القدرة الذكية من Phase 17.',
      'تعود المسودة إلى واجهة الأداة لعرضها ومراجعتها قبل أي استخدام خارجي.',
    ],
    inputs: ['الهدف الدراسي', 'الإنجازات والخبرات الأساسية', 'الجامعة أو المنحة المستهدفة إن وجدت'],
    outputs: ['مسودة خطاب دافع قابلة للمراجعة والتخصيص'],
    notes: [
      'المسودة ليست ضمانًا للقبول ولا بديلًا عن مراجعة الطالب.',
      'اختيار منحة أو جامعة أثناء الاستخدام هو سياق لهذا الطلب، وليس علاقة ثابتة في تعريف الأداة.',
    ],
    contextualLinks: [
      {
        category: 'scholarships',
        label: 'استكشف المنح',
        description: 'راجع فرص المنح ثم استخدم بيانات الفرصة كسياق عند إعداد المسودة.',
      },
      {
        category: 'universities',
        label: 'استكشف الجامعات',
        description: 'اختر الجهة المستهدفة دون إنشاء علاقة دائمة بين الأداة والجامعة.',
      },
    ],
  },
];

