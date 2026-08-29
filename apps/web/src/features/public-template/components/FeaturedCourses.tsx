import React, { useState } from 'react';
import { Course } from '../types';
import { PlayCircle, ChevronLeft, BookOpen, Award, Globe2, CheckCircle2, Star } from 'lucide-react';

interface FeaturedCoursesProps {
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
  onViewAllClick: () => void;
}

export const FeaturedCourses: React.FC<FeaturedCoursesProps> = ({
  courses,
  onSelectCourse,
  onViewAllClick,
}) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');

  // Filter courses based on provider mapping for demonstration
  // In a real app, this might be a specific flag like `course.isInternal`
  const internalCourses = courses.filter((c) => c.provider.includes('منارتك'));
  const externalCourses = courses.filter((c) => !c.provider.includes('منارتك'));

  const displayCourses = activeTab === 'internal' ? internalCourses : externalCourses;

  return (
    <section
      id="featured-courses-section"
      className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]"
    >
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-primary)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>الدورات التدريبية والتأهيلية</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              طور مهاراتك من خلال برامج تدريبية متخصصة ومقدمة من أفضل الأكاديميات والجامعات.
            </p>
          </div>

          {/* Smart Tabs / Segmented Control with Orbiting Animated Border */}
          <div className="relative mb-4 max-w-sm mx-auto p-[2px] rounded-[14px] overflow-hidden group">
            {/* Spinning Gradient Background */}
            <div className="absolute inset-[-100%] animate-button-orbit bg-[conic-gradient(from_0deg,var(--mn-primary),var(--mn-accent),var(--mn-primary),var(--mn-accent),var(--mn-primary))]" />

            {/* Inner Tabs Container */}
            <div className="relative flex bg-slate-50 p-1 rounded-xl w-full">
              <button
                onClick={() => setActiveTab('internal')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'internal'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Award
                  className={`w-3.5 h-3.5 ${activeTab === 'internal' ? 'text-[var(--mn-accent-text)]' : 'text-slate-400'}`}
                />
                <span>أكاديمية منارتك</span>
              </button>
              <button
                onClick={() => setActiveTab('external')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'external'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Globe2
                  className={`w-3.5 h-3.5 ${activeTab === 'external' ? 'text-blue-500' : 'text-slate-400'}`}
                />
                <span>جامعات عالمية</span>
              </button>
            </div>
          </div>

          {/* Courses List Wrapper */}
          <div className="space-y-3 w-full">
            {displayCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse && onSelectCourse(course)}
                className={`group relative flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-[var(--mn-surface)] border ${
                  activeTab === 'internal'
                    ? 'border-[var(--mn-accent)]/30 hover:border-[var(--mn-accent)]'
                    : 'border-slate-200 hover:border-blue-400'
                } shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]`}
              >
                {/* Course Thumbnail */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Course Info */}
                <div className="min-w-0 flex-1 flex flex-col justify-between h-full pt-0.5">
                  <div>
                    {/* Badge & Rating Row */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      {activeTab === 'internal' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--mn-accent)]/10 text-[var(--mn-accent-text)] border border-[var(--mn-accent)]/20 rounded text-[9px] font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> حصري
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-black">
                          شريك معتمد
                        </span>
                      )}

                      <div className="flex items-center gap-0.5 text-amber-500 text-[9px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[var(--mn-heading)] transition-colors line-clamp-2 leading-tight">
                      {course.title}
                    </h4>
                  </div>

                  <div className="mt-1.5 sm:mt-2">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1.5">
                      <span
                        className={
                          activeTab === 'internal'
                            ? 'text-[var(--mn-accent-text)]'
                            : 'text-blue-600'
                        }
                      >
                        {course.provider}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {displayCourses.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-500">
                لا توجد دورات حالياً في هذا القسم.
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="mt-4 flex justify-center">
            <button
              id="btn-view-all-courses"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع الدورات</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
