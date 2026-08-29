import React from 'react';
import { Course } from '../types';
import { BookOpen, Star, Clock, Users, Award, PlayCircle } from 'lucide-react';

interface CoursesListProps {
  courses: Course[];
  onStartCourse?: (course: Course) => void;
}

export const CoursesList: React.FC<CoursesListProps> = ({ courses }) => {
  return (
    <div className="w-full px-4 py-3 space-y-3 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[var(--mn-heading)]" />
            <span>الدورات التدريبية والتأهيلية للمنح</span>
          </h2>
          <p className="text-[11px] text-stone-500">
            برامج مجانية لإتقان اللغة والخطابات الأكاديمية وبناء الملف الشخصي
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-[var(--mn-surface)] rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden p-3.5 space-y-2.5 text-right hover:border-amber-400"
          >
            <div className="flex items-start gap-3">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#002E52] font-extrabold text-[9px]">
                    {course.isFree ? 'مجانية بالكامل' : 'مدفوعة'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-xs font-black text-stone-900 mt-1 leading-snug">
                  {course.title}
                </h3>
                <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                  تقديم: {course.instructor} • {course.provider}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <div className="flex items-center gap-3 text-stone-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--mn-heading)]" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-600" />
                  {course.studentsCount.toLocaleString()} طالب
                </span>
              </div>

              <button className="flex items-center gap-1 px-3 py-1 bg-[#002E52] hover:bg-slate-900 text-amber-300 rounded-xl text-xs font-bold active:scale-95 transition-all">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>متابعة الدورة</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
