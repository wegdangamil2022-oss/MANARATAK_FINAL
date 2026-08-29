import React from 'react';
import { University } from '../types';
import { Building2, Trophy, Globe, GraduationCap, ExternalLink, ChevronLeft } from 'lucide-react';

interface UniversitiesListProps {
  universities: University[];
  onSelectUniversity?: (uni: University) => void;
}

export const UniversitiesList: React.FC<UniversitiesListProps> = ({ universities }) => {
  return (
    <div className="w-full px-4 py-3 space-y-3 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[var(--mn-heading)]" />
            <span>أفضل الجامعات العالمية والشريكة</span>
          </h2>
          <p className="text-[11px] text-stone-500">
            تصفح الجامعات الرائدة التي تقدم منحاً دراسية كاملة
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {universities.map((uni) => (
          <div
            key={uni.id}
            className="bg-[var(--mn-surface)] rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden p-3.5 space-y-2.5 text-right hover:border-amber-400"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={uni.imageUrl}
                  alt={uni.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-stone-900">
                      {uni.name}{' '}
                      <span className="text-stone-500 font-semibold mr-0.5">
                        ({uni.nameEn.replace('University of ', '').replace(' University', '')})
                      </span>
                    </span>
                    <span className="text-xs">{uni.countryFlag}</span>
                  </div>
                </div>
              </div>

              {/* Global Rank Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-black shrink-0">
                <Trophy className="w-3 h-3 text-amber-600" />
                <span>المرتبة #{uni.globalRank}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">{uni.description}</p>

            <div className="flex flex-wrap gap-1 pt-1">
              {uni.topMajors.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-3 text-[11px] text-[#002E52] font-bold">
                <span>🎓 {uni.scholarshipCount} منحة معتمدة</span>
                <span>نسبة القبول: {uni.acceptanceRate}</span>
              </div>

              <a
                href={uni.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700 hover:text-amber-800 hover:underline"
              >
                <span>موقع الجامعة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
