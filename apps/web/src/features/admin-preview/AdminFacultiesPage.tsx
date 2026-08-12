import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle2,
  ChevronLeft,
  Filter,
  Layers,
  Award,
} from 'lucide-react';
import { ApiClient } from '../../api/client';

interface CollegeItem {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  supportedDegrees: string[]; // e.g., ['Bachelor', 'Master', 'Doctorate', 'Fellowship']
  description: string;
  departmentCount: number;
}

const ALL_COLLEGES: CollegeItem[] = [
  {
    id: 'col-med',
    nameAr: 'كلية الطب والعلوم الطبية الأساسية',
    nameEn: 'Faculty of Medicine & Basic Medical Sciences',
    code: 'FAC-MED',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'تضم تخصصات الطب والجراحة والعلوم الطبية الأساسية والأحياء الدقيقة والتشريح.',
    departmentCount: 14,
  },
  {
    id: 'col-dent',
    nameAr: 'كلية طب الأسنان',
    nameEn: 'Faculty of Dentistry',
    code: 'FAC-DENT',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'تختص بطب وجراحة الفم والأسنان وتقويم الأسنان وعلاج الجذور.',
    departmentCount: 8,
  },
  {
    id: 'col-pharm',
    nameAr: 'كلية الصيدلة والعلوم الدوائية',
    nameEn: 'Faculty of Pharmacy',
    code: 'FAC-PHARM',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'برامج الصيدلة الإكلينيكية ودكتور صيدلة وتطوير الأدوية والسموم.',
    departmentCount: 6,
  },
  {
    id: 'col-nurs',
    nameAr: 'كلية التمريض والقبالة',
    nameEn: 'Faculty of Nursing & Midwifery',
    code: 'FAC-NURS',
    supportedDegrees: ['Bachelor', 'Master'],
    description: 'إعداد الكوادر التمريضية المتخصصة في الرعاية الحادة وصحة المجتمع.',
    departmentCount: 5,
  },
  {
    id: 'col-ams',
    nameAr: 'كلية العلوم الطبية التطبيقية',
    nameEn: 'Faculty of Applied Medical Sciences',
    code: 'FAC-AMS',
    supportedDegrees: ['Bachelor', 'Master'],
    description: 'المختبرات الطبية، الأشعة والتصوير الطبي، والعلاج الطبيعي.',
    departmentCount: 7,
  },
  {
    id: 'col-fel',
    nameAr: 'عمادة الزمالات والتدريب السريري العالي',
    nameEn: 'Deanship of Clinical Fellowships',
    code: 'FAC-FEL',
    supportedDegrees: ['Fellowship'],
    description: 'برامج الزمالات السريرية المتقدمة في القلب والأوعية والأمراض الصدرية.',
    departmentCount: 10,
  },
  {
    id: 'col-eng',
    nameAr: 'كلية الهندسة والتكنولوجيا',
    nameEn: 'Faculty of Engineering & Technology',
    code: 'FAC-ENG',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'هندسة الحاسوب، الهندسة المدنية، الكهربائية، والأنظمة المدمجة.',
    departmentCount: 12,
  },
  {
    id: 'col-cs',
    nameAr: 'كلية الحاسبات والذكاء الاصطناعي',
    nameEn: 'Faculty of Computing & AI',
    code: 'FAC-CS',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'علوم الحاسب، الذكاء الاصطناعي، الأمن السيبراني، وهندسة البرمجيات.',
    departmentCount: 9,
  },
  {
    id: 'col-bus',
    nameAr: 'كلية إدارة الأعمال والاقتصاد',
    nameEn: 'Faculty of Business & Economics',
    code: 'FAC-BUS',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'إدارة الأعمال، التمويل والمصرفية، المحاسبة، والتسويق الرقمي.',
    departmentCount: 8,
  },
  {
    id: 'col-sci',
    nameAr: 'كلية العلوم والرياضيات',
    nameEn: 'Faculty of Science & Mathematics',
    code: 'FAC-SCI',
    supportedDegrees: ['Bachelor', 'Master', 'Doctorate'],
    description: 'الكيمياء، الفيزياء التطبيقية، الرياضيات، والأحياء العامة.',
    departmentCount: 6,
  },
];

const DEGREE_TABS = [
  { value: 'ALL', labelAr: 'كل الدرجات التعليمية', labelEn: 'All Degrees', icon: Layers },
  { value: 'Bachelor', labelAr: 'بكالوريوس', labelEn: 'Bachelor', icon: GraduationCap },
  { value: 'Master', labelAr: 'ماجستير', labelEn: 'Master', icon: BookOpen },
  { value: 'Doctorate', labelAr: 'دكتوراه', labelEn: 'Doctorate', icon: Award },
  { value: 'Fellowship', labelAr: 'زمالة', labelEn: 'Fellowship', icon: Building2 },
];

export function AdminFacultiesPage() {
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dbMajors, setDbMajors] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await ApiClient.getAdminMajors({
          page: 1,
          pageSize: 100,
          catalog: 'true',
          search: searchQuery.trim() || undefined,
          degreeLevel: selectedDegree === 'ALL' ? undefined : selectedDegree,
        });
        if (!cancelled && Array.isArray(response.data)) {
          const items = response.data.map((item: any) => ({
            code: item.code || item.classificationCode || item.id,
            degreeLevel: item.degreeLevel,
            collegeOrField: item.collegeOrField || item.collegeOrFaculty || item.academicFieldOrDiscipline || '',
          }));
          setDbMajors(items);
        }
      } catch {
        // ignore fallback
      }
    }
    const timer = window.setTimeout(() => void load(), 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, selectedDegree]);

  const allMajors = dbMajors;

  // Filter colleges based on selected educational degree level & search
  const filteredColleges = useMemo(() => {
    return ALL_COLLEGES.filter((college) => {
      const matchesDegree =
        selectedDegree === 'ALL' || college.supportedDegrees.includes(selectedDegree);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        college.nameAr.toLowerCase().includes(query) ||
        college.nameEn.toLowerCase().includes(query) ||
        college.code.toLowerCase().includes(query);

      return matchesDegree && matchesSearch;
    });
  }, [selectedDegree, searchQuery]);

  if (!adminSessionPresent) return <Navigate to="/login" replace />;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-slate-900 sm:px-6 lg:px-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              لوحة التحكم · إدارة الهيكل الأكاديمي
            </p>
            <h1 className="mt-3 text-[26px] font-black leading-9 sm:text-[34px] text-slate-950">
              الكليات والعمادات الأكاديمية
            </h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-7 text-slate-500">
              استعرض الكليات المعتمدة ومجالاتها الأكاديمية والتخصصات المندمجة بها حسب الدرجة التعليمية المحددة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/majors"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5d48] px-4 text-[13px] font-extrabold text-white shadow-sm hover:bg-[#0b4c3b]"
            >
              <BookOpen className="h-4 w-4" />
              الانتقال للتخصصات
            </Link>
          </div>
        </header>

        {/* Degree Selector Filter Bar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[14px] font-black text-slate-900">
              <Filter className="h-4 w-4 text-emerald-700" />
              اختر الدرجة التعليمية لعرض الكليات التابعة لها:
            </div>
            <span className="text-[12px] font-bold text-slate-500">
              تم العثور على {filteredColleges.length} كلية
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEGREE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedDegree === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedDegree(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                  {tab.labelAr}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative pt-2">
            <Search className="absolute right-3 top-5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الكلية أو الكود المرجعي..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 text-[13px] outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </section>

        {/* Colleges Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredColleges.map((college) => {
            // Find majors that match this college & selected degree
            const collegeMajors = allMajors.filter((m) => {
              const matchesCollege =
                m.collegeOrField?.includes(college.nameAr.replace('كلية ', '')) ||
                m.collegeOrField?.includes(college.nameAr) ||
                college.nameAr.includes(m.collegeOrField ?? '');
              const matchesDegree =
                selectedDegree === 'ALL' || m.degreeLevel === selectedDegree;
              return matchesCollege && matchesDegree;
            });

            return (
              <article
                key={college.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700">
                      {college.code}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                      <Building2 className="h-3 w-3" />
                      كلية معتمدة
                    </span>
                  </div>

                  <h2 className="mt-3 text-[17px] font-black leading-7 text-slate-950">
                    {college.nameAr}
                  </h2>
                  <p dir="ltr" className="text-right text-[12px] font-semibold text-slate-400">
                    {college.nameEn}
                  </p>

                  <p className="mt-3 text-[12.5px] leading-6 text-slate-600">
                    {college.description}
                  </p>

                  {/* Supported Degree Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {college.supportedDegrees.map((deg) => (
                      <span
                        key={deg}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          deg === selectedDegree
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {deg === 'Bachelor'
                          ? 'بكالوريوس'
                          : deg === 'Master'
                          ? 'ماجستير'
                          : deg === 'Doctorate'
                          ? 'دكتوراه'
                          : 'زمالة'}
                      </span>
                    ))}
                  </div>

                  {/* Majors preview */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-[12px] font-bold text-slate-700">
                      <span>التخصصات المتاحة ({collegeMajors.length > 0 ? collegeMajors.length : college.departmentCount})</span>
                      <span className="text-emerald-700">مرحلة 10</span>
                    </div>
                    {collegeMajors.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-[11.5px] text-slate-600">
                        {collegeMajors.slice(0, 3).map((m) => (
                          <li key={m.code} className="truncate flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                            <span>{m.displayName} ({m.code})</span>
                          </li>
                        ))}
                        {collegeMajors.length > 3 && (
                          <li className="text-[11px] font-bold text-emerald-800 pt-1">
                            +{collegeMajors.length - 3} تخصصات إضافية
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        تتوفر أقسام وتخصصات متعددة تحت هذه الكلية في الكتالوج.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <Link
                    to={`/admin/majors?field=${encodeURIComponent(college.nameAr)}`}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[12.5px] font-extrabold text-slate-800 hover:bg-slate-50 hover:border-emerald-300 transition-colors"
                  >
                    عرض تخصصات الكلية
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
