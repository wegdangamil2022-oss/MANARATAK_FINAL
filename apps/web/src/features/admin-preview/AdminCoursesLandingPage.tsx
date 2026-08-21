import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  DollarSign,
  DownloadCloud,
  Layers,
} from 'lucide-react';

const sections = [
  {
    id: 'native',
    title: 'دورات منارتك',
    description: 'إنشاء وإدارة الدورات المؤلفة داخل منارتك، بما يشمل المناهج والوحدات والدروس والاختبارات والتقييمات.',
    note: 'تأليف المناهج والدروس والتقييمات داخليًا',
    route: '/admin/courses/native',
    button: 'إدارة دورات منارتك',
    icon: BookOpen,
  },
  {
    id: 'imported',
    title: 'الدورات المستوردة',
    description: 'إدارة كتالوج الدورات الخارجية المستوردة من المنصات والجامعات، والتحقق من المجانية والشهادات والروابط والمصادر.',
    note: 'الكتالوج الخارجي والتحقق والمراجعة والنشر',
    route: '/admin/courses/imported',
    button: 'إدارة الدورات المستوردة',
    icon: DownloadCloud,
  },
  {
    id: 'paid',
    title: 'الدورات المدفوعة',
    description: 'إدارة الدورات والبرامج التدريبية المسعرة وربطها بمرجع التسعير وتنفيذ الدفع في المنصة المالية.',
    note: 'التسعير والاشتراكات والتكامل المالي',
    route: '/admin/courses/paid',
    button: 'إدارة الدورات المدفوعة',
    icon: DollarSign,
  },
] as const;

export function AdminCoursesLandingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex w-fit items-center gap-2 text-xs font-bold text-emerald-300 sm:text-sm">
              <Layers className="h-4 w-4" />
              <span>مساحة إدارة الدورات التعليمية</span>
            </div>
            <h1 className="text-2xl font-black sm:text-4xl">إدارة الدورات</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-emerald-100/90">
              إدارة الدورات التعليمية من مكان واحد مع فصل واضح بين الدورات المؤلفة داخل منارتك، والدورات الخارجية المستوردة، والدورات المدفوعة.
            </p>
          </div>

          <div className="min-w-[150px] rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
            <span className="block text-3xl font-black text-amber-300">3</span>
            <span className="text-[11px] font-bold text-emerald-100">أقسام رئيسية للدورات</span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {sections.map(section => {
            const Icon = section.icon;
            const featured = section.id === 'imported';

            return (
              <article
                key={section.id}
                className={`flex min-h-[300px] flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  featured ? 'border-[#0F4B3A]/40 ring-1 ring-[#0F4B3A]/10' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${featured ? 'bg-[#0F4B3A] text-white' : 'bg-emerald-50 text-[#0F4B3A]'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {featured && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">
                        الكتالوج الخارجي
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{section.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{section.description}</p>

                  <div className="mt-5 flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-600">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{section.note}</span>
                  </div>
                </div>

                <Link
                  to={section.route}
                  className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition-colors ${
                    featured
                      ? 'bg-[#0F4B3A] text-white hover:bg-[#0a382b]'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <span>{section.button}</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-sm leading-7 text-emerald-950 shadow-sm">
          <span className="font-black">حدود الإدارة:</span>{' '}
          بيانات الدورات ومنطقها التعليمي تتبع منصة التعلم، بينما توفر لوحة الإدارة أدوات المراجعة والتحرير والنشر. الملفات التعليمية تُدار عبر منصة الأصول، والشهادات عبر منصة الشهادات، وتنفيذ المدفوعات عبر المنصة المالية.
        </section>
      </div>
    </main>
  );
}
