export type MajorDegreeTemplateKey = 'Bachelor' | 'Master' | 'Doctorate' | 'Fellowship';

export interface MajorDegreeTemplateSection {
  key: string;
  titleAr: string;
  titleEn: string;
  purposeAr: string;
  aliasesAr?: string[];
}

export interface MajorDegreeTemplate {
  key: MajorDegreeTemplateKey;
  labelAr: string;
  labelEn: string;
  summaryAr: string;
  sections: MajorDegreeTemplateSection[];
}

export const majorDegreeTemplates: Record<MajorDegreeTemplateKey, MajorDegreeTemplate> = {
  Bachelor: {
    key: 'Bachelor',
    labelAr: 'بكالوريوس',
    labelEn: 'Bachelor',
    summaryAr: 'قالب يركز على الدراسة الجامعية الأولى، المواد، المهارات، التدريب، الوظائف، والمسارات اللاحقة.',
    sections: [
      { key: 'overview', titleAr: 'النبذة', titleEn: 'Overview', purposeAr: 'تعريف مختصر بالتخصص وما يميزه.', aliasesAr: ['نبذة', 'النبذة', 'نبذة عن التخصص', 'التعريف بالتخصص'] },
      { key: 'what-students-study', titleAr: 'ماذا يدرس الطالب', titleEn: 'What Students Study', purposeAr: 'الموضوعات والمساقات التي يواجهها الطالب.', aliasesAr: ['ماذا يدرس', 'الموضوعات', 'المساقات', 'الخطة الدراسية'] },
      { key: 'foundation-courses', titleAr: 'المواد التأسيسية', titleEn: 'Foundation Courses', purposeAr: 'الأساسيات المطلوبة قبل التعمق.', aliasesAr: ['المواد التأسيسية', 'التأسيس', 'المتطلبات التأسيسية'] },
      { key: 'core-courses', titleAr: 'المواد الأساسية', titleEn: 'Core Courses', purposeAr: 'المواد المركزية في التخصص.', aliasesAr: ['المواد الأساسية', 'المقررات الأساسية', 'تخصصية'] },
      { key: 'practical-training', titleAr: 'الجانب العملي', titleEn: 'Practical Training', purposeAr: 'المعامل، التدريب، المشاريع أو التطبيق الميداني.', aliasesAr: ['الجانب العملي', 'التدريب العملي', 'التدريب الميداني', 'المعامل'] },
      { key: 'skills', titleAr: 'المهارات', titleEn: 'Skills', purposeAr: 'المهارات العلمية والمهنية التي يكتسبها الطالب.', aliasesAr: ['المهارات', 'المهارات المكتسبة'] },
      { key: 'tracks', titleAr: 'المسارات', titleEn: 'Tracks', purposeAr: 'التفرعات أو المسارات الداخلية.', aliasesAr: ['المسارات', 'التفرعات', 'المسارات والتخصصات'] },
      { key: 'careers', titleAr: 'الوظائف', titleEn: 'Careers', purposeAr: 'المجالات الوظيفية الممكنة.', aliasesAr: ['الوظائف', 'مجالات العمل', 'فرص العمل', 'أهم الوظائف'] },
      { key: 'postgraduate-pathways', titleAr: 'الدراسات العليا', titleEn: 'Postgraduate Pathways', purposeAr: 'الماجستير أو التخصصات اللاحقة المناسبة.', aliasesAr: ['الدراسات العليا', 'المسارات اللاحقة'] },
      { key: 'similar-majors', titleAr: 'التخصصات المشابهة', titleEn: 'Similar Majors', purposeAr: 'روابط تخصصات قريبة أو بديلة.', aliasesAr: ['التخصصات المشابهة', 'تخصصات قريبة'] },
    ],
  },
  Master: {
    key: 'Master',
    labelAr: 'ماجستير',
    labelEn: 'Master',
    summaryAr: 'قالب يركز على نوع البرنامج، الخلفيات المقبولة، المقررات المتقدمة، والبحث أو المشروع.',
    sections: [
      { key: 'overview', titleAr: 'النبذة', titleEn: 'Overview', purposeAr: 'تعريف بالبرنامج واتجاهه.', aliasesAr: ['نبذة', 'النبذة', 'نبذة عن تخصص الماجستير', 'طبيعة الماجستير', 'تعريف بالبرنامج', 'معلومات تخصص الماجستير الأساسية'] },
      { key: 'master-type', titleAr: 'نوع الماجستير', titleEn: 'Master Type', purposeAr: 'مهني، بحثي، تنفيذي، أو مختلط.', aliasesAr: ['نوع الماجستير', 'أنواع البرنامج', 'أنواع البرنامج الشائعة', 'مسارات البرنامج'] },
      { key: 'accepted-backgrounds', titleAr: 'الخلفيات المقبولة', titleEn: 'Accepted Backgrounds', purposeAr: 'التخصصات السابقة المناسبة للقبول.', aliasesAr: ['الخلفيات المقبولة', 'الخلفيات الأكاديمية المناسبة للقبول', 'شروط القبول', 'المؤهلات المطلوبة', 'تخصصات بكالوريوس مرتبطة مباشرة', 'تخصصات قريبة قد تقبل', 'تخصصات قد تحتاج مقررات استدراكية'] },
      { key: 'advanced-courses', titleAr: 'المقررات المتقدمة', titleEn: 'Advanced Courses', purposeAr: 'مقررات التخصص المتقدم.', aliasesAr: ['المقررات المتقدمة', 'ماذا يدرس الطالب', 'المتطلبات التأسيسية أو الاستدراكية العامة', 'المعرفة والمقررات', 'المقررات الأساسية', 'المقررات الاختيارية', 'مناهج البحث والتحليل', 'الجانب العملي أو التطبيقي', 'المسارات والتخصصات الدقيقة'] },
      { key: 'research-or-project', titleAr: 'البحث أو المشروع', titleEn: 'Research or Project', purposeAr: 'رسالة، مشروع تطبيقي، أو بحث.', aliasesAr: ['البحث أو المشروع', 'مكونات التخرج', 'الأطروحة', 'الرسالة', 'مشروع البحث'] },
      { key: 'research-professional-skills', titleAr: 'المهارات البحثية والمهنية', titleEn: 'Research and Professional Skills', purposeAr: 'مهارات التحليل، المنهجية، والممارسة.', aliasesAr: ['المهارات البحثية والمهنية', 'المهارات المتقدمة المكتسبة', 'المهارات'] },
      { key: 'bachelor-relationship', titleAr: 'العلاقة بالبكالوريوس', titleEn: 'Bachelor Relationship', purposeAr: 'ما يرتبط به من تخصصات بكالوريوس.', aliasesAr: ['العلاقة بالبكالوريوس', 'العلاقة بتخصصات البكالوريوس'] },
      { key: 'after-graduation', titleAr: 'المسارات بعد التخرج', titleEn: 'After Graduation', purposeAr: 'وظائف، دكتوراه، أو مسارات مهنية.', aliasesAr: ['المسارات بعد التخرج', 'مجالات العمل بعد الماجستير', 'أهم الوظائف المرتبطة', 'المسارات الأكاديمية والمهنية اللاحقة', 'الدكتوراه المرتبطة', 'الزمالات أو الاعتمادات المهنية المرتبطة'] },
      { key: 'similar-majors', titleAr: 'التخصصات المشابهة', titleEn: 'Similar Majors', purposeAr: 'برامج ماجستير قريبة أو بديلة.', aliasesAr: ['التخصصات المشابهة', 'التخصصات المشابهة والفروق', 'التنبيه الأكاديمي والمهني', 'المصادر والتحقق'] },
    ],
  },
  Doctorate: {
    key: 'Doctorate',
    labelAr: 'دكتوراه',
    labelEn: 'Doctorate',
    summaryAr: 'قالب يركز على طبيعة البحث، موضوعات الأطروحة، الإشراف، النشر، والمسار الأكاديمي.',
    sections: [
      { key: 'overview', titleAr: 'النبذة', titleEn: 'Overview', purposeAr: 'تعريف بمجال الدكتوراه وعمقه البحثي.', aliasesAr: ['نبذة', 'النبذة', 'طبيعة الدكتوراه وهدفها', 'نبذة عن تخصص الدكتوراه'] },
      { key: 'doctorate-type', titleAr: 'بحثية أو مهنية', titleEn: 'Doctorate Type', purposeAr: 'PhD أو دكتوراه مهنية أو مسار مختلط.', aliasesAr: ['بحثية أو مهنية', 'أنواع الدكتوراه الشائعة', 'نوع الدكتوراه'] },
      { key: 'entry-routes', titleAr: 'مسارات الدخول', titleEn: 'Entry Routes', purposeAr: 'المتطلبات والخلفيات المناسبة.', aliasesAr: ['مسارات الدخول', 'الخلفيات الأكاديمية المناسبة ومسارات الدخول', 'شروط الدخول'] },
      { key: 'research-topics', titleAr: 'موضوعات البحث', titleEn: 'Research Topics', purposeAr: 'المحاور البحثية المحتملة.', aliasesAr: ['موضوعات البحث', 'مجالات البحث والتخصصات الدقيقة', 'المعرفة والمقررات المتقدمة'] },
      { key: 'dissertation', titleAr: 'الأطروحة', titleEn: 'Dissertation', purposeAr: 'طبيعة الأطروحة ومخرجاتها.', aliasesAr: ['الأطروحة', 'الأطروحة والمساهمة الأصلية', 'مقترح البحث ومرحلة الترشح'] },
      { key: 'supervision', titleAr: 'الإشراف', titleEn: 'Supervision', purposeAr: 'علاقة الطالب بالمشرف أو اللجنة.', aliasesAr: ['الإشراف', 'الإشراف والبيئة البحثية'] },
      { key: 'publication', titleAr: 'النشر', titleEn: 'Publication', purposeAr: 'متطلبات النشر أو الإنتاج العلمي.', aliasesAr: ['النشر', 'متطلبات البحث والنشر والتدريس'] },
      { key: 'academic-career-path', titleAr: 'المسار الأكاديمي والمهني', titleEn: 'Academic and Career Path', purposeAr: 'أين يتجه الخريج بعد الدكتوراه.', aliasesAr: ['المسار الأكاديمي والمهني', 'ما بعد الدكتوراه والمسارات اللاحقة', 'مجالات العمل بعد الدكتوراه', 'أهم الوظائف المرتبطة'] },
      { key: 'similar-majors', titleAr: 'التخصصات المشابهة', titleEn: 'Similar Majors', purposeAr: 'تخصصات بحثية قريبة.', aliasesAr: ['التخصصات المشابهة', 'الدكتوراه المشابهة والفروق'] },
    ],
  },
  Fellowship: {
    key: 'Fellowship',
    labelAr: 'زمالة',
    labelEn: 'Fellowship',
    summaryAr: 'قالب يركز على التدريب المهني المتقدم، الترخيص، التقييم، والفئة المستهدفة.',
    sections: [
      { key: 'overview', titleAr: 'النبذة', titleEn: 'Overview', purposeAr: 'تعريف بالزمالة ومجالها المهني.', aliasesAr: ['نبذة', 'النبذة', 'طبيعة الزمالة وهدفها', 'نبذة عن الزمالة'] },
      { key: 'fellowship-type', titleAr: 'نوع الزمالة', titleEn: 'Fellowship Type', purposeAr: 'سريرية، مهنية، بحثية، أو تدريبية.', aliasesAr: ['نوع الزمالة', 'أنواع الزمالة'] },
      { key: 'target-audience', titleAr: 'الفئة المستهدفة', titleEn: 'Target Audience', purposeAr: 'من يمكنه الالتحاق بالزمالة.', aliasesAr: ['الفئة المستهدفة'] },
      { key: 'prerequisites', titleAr: 'المتطلبات السابقة', titleEn: 'Prerequisites', purposeAr: 'الشهادات والخبرات المطلوبة.', aliasesAr: ['المتطلبات السابقة', 'المؤهلات السابقة العامة'] },
      { key: 'licensure', titleAr: 'الترخيص', titleEn: 'Licensure', purposeAr: 'اشتراطات الترخيص أو التسجيل المهني.', aliasesAr: ['الترخيص', 'نطاق الممارسة والترخيص'] },
      { key: 'training', titleAr: 'التدريب', titleEn: 'Training', purposeAr: 'طبيعة التدريب العملي أو السريري.', aliasesAr: ['التدريب', 'مكونات التدريب', 'المدة ونمط التدريب'] },
      { key: 'assessment', titleAr: 'التقييم', titleEn: 'Assessment', purposeAr: 'الاختبارات، التقييمات، أو المتطلبات النهائية.', aliasesAr: ['التقييم', 'التقييم ومتطلبات الإكمال'] },
      { key: 'credential-outcome', titleAr: 'الشهادة أو الصفة الناتجة', titleEn: 'Credential Outcome', purposeAr: 'ما يحصل عليه المتدرب بعد الإكمال.', aliasesAr: ['الشهادة أو الصفة الناتجة'] },
      { key: 'related-majors', titleAr: 'التخصصات المرتبطة', titleEn: 'Related Majors', purposeAr: 'التخصصات الأكاديمية أو المهنية المرتبطة.', aliasesAr: ['التخصصات المرتبطة', 'الزمالات المشابهة والفروق', 'العلاقة بالإقامة والبورد والدكتوراه', 'مجالات العمل بعد الزمالة'] },
    ],
  },
};

export function normalizeMajorDegreeTemplateKey(value?: string): MajorDegreeTemplateKey {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'master' || normalized === 'masters' || normalized === 'ماجستير') return 'Master';
  if (normalized === 'doctorate' || normalized === 'doctoral' || normalized === 'phd' || normalized === 'دكتوراه') return 'Doctorate';
  if (normalized === 'fellowship' || normalized === 'زمالة') return 'Fellowship';
  return 'Bachelor';
}

export function getMajorDegreeTemplate(value?: string): MajorDegreeTemplate {
  return majorDegreeTemplates[normalizeMajorDegreeTemplateKey(value)];
}
