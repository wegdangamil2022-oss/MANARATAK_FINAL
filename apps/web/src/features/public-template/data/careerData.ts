import { CareerOpportunityPreview } from '../types';

/**
 * Public UI integration samples only. These are intentionally fictional and
 * must never be presented as live job postings. Real records will come from
 * the canonical Phase 21 Career & Alumni Platform registry/API.
 */
export const CAREER_OPPORTUNITIES_PREVIEW: CareerOpportunityPreview[] = [
  {
    id: 'career-preview-frontend-internship',
    title: 'متدرب تطوير واجهات Frontend',
    titleEn: 'Frontend Development Intern',
    employerName: 'شركة تقنية دولية — نموذج تجريبي',
    kind: 'تدريب',
    subtype: 'تدريب صيفي',
    country: 'السعودية',
    countryFlag: '🇸🇦',
    city: 'الرياض',
    workMode: 'حضوري',
    industry: 'التقنية والبرمجيات',
    employmentType: 'تدريب',
    experienceLevel: 'طالب جامعي',
    salaryLabel: 'المكافأة تحددها الجهة',
    durationLabel: '8–12 أسبوعًا',
    summary: 'فرصة تدريبية نموذجية لاختبار عرض فرص الطلاب وربطها بالتخصصات والدورات والدولة داخل منارتك.',
    description:
      'نموذج واجهة يمثل تدريبًا صيفيًا لطلاب الحاسب والبرمجيات. المحتوى تجريبي بالكامل والغرض منه اختبار تجربة البحث والتفاصيل والترابط قبل توصيل الواجهة بسجل Phase 21 الحقيقي.',
    responsibilities: [
      'المشاركة في تطوير واجهات ويب ضمن فريق تقني.',
      'تحويل التصاميم إلى مكونات قابلة لإعادة الاستخدام.',
      'مراجعة جودة الواجهة وتجربة الاستخدام على الهاتف والويب.',
    ],
    requirements: [
      'طالب جامعي في تخصص تقني أو مجال قريب.',
      'أساسيات HTML وCSS وJavaScript.',
      'القدرة على التعلم والعمل ضمن فريق.',
    ],
    targetSkills: ['JavaScript', 'React', 'HTML/CSS', 'Git', 'حل المشكلات'],
    benefits: ['خبرة عملية منظمة', 'إشراف وتغذية راجعة', 'مشروع تطبيقي ضمن بيئة فريق'],
    applicationSteps: [
      'مراجعة تفاصيل الفرصة والمتطلبات.',
      'تجهيز الملف المهني والسيرة الذاتية عند تفعيل Career Profile.',
      'إرسال الطلب عبر Phase 21 بعد ربط الواجهة العامة بالـAPI.',
    ],
    contextLinks: [
      {
        category: 'majors',
        label: 'تخصصات مرتبطة بالسياق',
        description: 'استكشف تخصصات الحاسب وهندسة البرمجيات دون اعتبارها علاقة إلزامية بهذه الفرصة التجريبية.',
      },
      {
        category: 'courses',
        label: 'دورات تساعد على الاستعداد',
        description: 'استكشف دورات البرمجة والواجهات لتحسين المهارات المطلوبة.',
      },
    ],
  },
  {
    id: 'career-preview-junior-data-analyst',
    title: 'محلل بيانات مبتدئ',
    titleEn: 'Junior Data Analyst',
    employerName: 'فريق بيانات دولي — نموذج تجريبي',
    kind: 'وظيفة',
    subtype: 'وظيفة مبتدئة',
    country: 'المملكة المتحدة',
    countryFlag: '🇬🇧',
    city: 'عن بعد',
    workMode: 'عن بعد',
    industry: 'البيانات والتحليلات',
    employmentType: 'دوام كامل',
    experienceLevel: 'مبتدئ',
    salaryLabel: 'الراتب غير معلن',
    summary: 'نموذج وظيفة عن بعد لاختبار الفلاتر المهنية، متطلبات المهارات، وعرض الدولة والتخصصات ذات الصلة سياقيًا.',
    description:
      'سجل تجريبي يمثل وظيفة بداية مسار مهني في تحليل البيانات. لا يمثل شركة أو شاغرًا حقيقيًا، ويستخدم فقط لإثبات نموذج Phase 21 في الواجهة العامة.',
    responsibilities: [
      'تنظيف مجموعات البيانات وتجهيزها للتحليل.',
      'إعداد تقارير ولوحات مؤشرات مبسطة.',
      'التعاون مع فرق الأعمال لتحويل الأسئلة إلى مؤشرات قابلة للقياس.',
    ],
    requirements: [
      'أساسيات تحليل البيانات والإحصاء.',
      'معرفة عملية بأدوات الجداول أو SQL.',
      'قدرة جيدة على تفسير النتائج وشرحها بوضوح.',
    ],
    targetSkills: ['SQL', 'Excel', 'Data Visualization', 'Statistics', 'Communication'],
    benefits: ['نمط عمل عن بعد', 'بداية مسار مهني في البيانات', 'فرص تطوير مهني داخل الفريق'],
    applicationSteps: [
      'مراجعة المهارات والمتطلبات.',
      'تجهيز السيرة والملف المهني.',
      'التقديم من خلال Career Profile عند توصيل مسار الطلبات الحقيقي.',
    ],
    contextLinks: [
      {
        category: 'majors',
        label: 'استكشف تخصصات البيانات',
        description: 'راجع التخصصات التي تقود عادةً إلى تحليل البيانات والمسارات القريبة منه.',
      },
      {
        category: 'courses',
        label: 'طوّر مهاراتك بالدورات',
        description: 'انتقل إلى الدورات للبحث عن SQL والتحليل والإحصاء وأدوات التصور.',
      },
    ],
  },
  {
    id: 'career-preview-graduate-program',
    title: 'برنامج خريجين في تحليل الأعمال',
    titleEn: 'Business Analytics Graduate Program',
    employerName: 'مجموعة أعمال دولية — نموذج تجريبي',
    kind: 'برنامج خريجين',
    subtype: 'برنامج حديثي التخرج',
    country: 'الصين',
    countryFlag: '🇨🇳',
    city: 'شنغهاي',
    workMode: 'حضوري',
    industry: 'الأعمال والاستشارات',
    employmentType: 'برنامج خريجين',
    experienceLevel: 'حديث التخرج',
    salaryLabel: 'التعويض يحدد حسب البرنامج',
    durationLabel: '12 شهرًا',
    summary: 'نموذج برنامج خريجين يختبر المسار الثالث في Phase 21 والعلاقة بين الفرص المهنية والاستعداد الأكاديمي والأدوات.',
    description:
      'نموذج غير حقيقي لبرنامج تطوير حديثي التخرج يتضمن دورات عمل متتابعة وإرشادًا مهنيًا. يستخدم فقط لاختبار تجربة المنتج قبل إدخال بيانات جهات فعلية.',
    responsibilities: [
      'التنقل بين فرق تحليل الأعمال والتخطيط.',
      'تنفيذ مشاريع قصيرة تحت إشراف متخصصين.',
      'عرض النتائج والتوصيات على فرق متعددة التخصصات.',
    ],
    requirements: [
      'حديث تخرج أو في السنة النهائية.',
      'خلفية في الأعمال أو الاقتصاد أو البيانات أو تخصص قريب.',
      'مهارات تحليل واتصال جيدة.',
    ],
    targetSkills: ['Business Analysis', 'Problem Solving', 'Presentation', 'Excel', 'Teamwork'],
    benefits: ['برنامج تطوير منظم', 'تدوير وظيفي', 'إرشاد مهني', 'خبرة متعددة الأقسام'],
    applicationSteps: [
      'مراجعة شروط البرنامج.',
      'تجهيز السيرة والمستندات المطلوبة.',
      'إكمال مراحل التقديم والمقابلة عند تفعيل Recruitment Workflow.',
    ],
    contextLinks: [
      {
        category: 'majors',
        label: 'تخصصات مناسبة للمسار',
        description: 'استكشف تخصصات الأعمال والاقتصاد وتحليل البيانات القريبة من هذا النوع من البرامج.',
      },
      {
        category: 'articles',
        label: 'أدلة الاستعداد للتقديم',
        description: 'راجع المقالات والأدلة المتعلقة بالتقديم والمقابلات والاستعداد المهني.',
      },
    ],
    suggestTools: true,
  },
];

