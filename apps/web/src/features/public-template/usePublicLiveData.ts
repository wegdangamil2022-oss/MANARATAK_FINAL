import { useCallback, useEffect, useState } from 'react';
import { loadPublicLiveSnapshot, type PublicLiveLoadResult, type PublicLiveLocale } from './publicLiveDataSource';
import { resolvePublicTemplateDataMode, type PublicTemplateDataMode } from './publicScholarshipDataSource';

const initial: PublicLiveLoadResult = {
  data: { scholarships: [], universities: [], majors: [], countries: [], exams: [], courses: [], importedCourses: [], articles: [], services: [], careers: [], tools: [] },
  statuses: { scholarships: 'loading', universities: 'loading', majors: 'loading', countries: 'loading', exams: 'loading', courses: 'loading', articles: 'loading', services: 'loading', careers: 'loading', tools: 'loading' },
  errors: {},
};

export function usePublicLiveData(value: unknown, locale: PublicLiveLocale = 'ar') {
  const mode: PublicTemplateDataMode = resolvePublicTemplateDataMode(value);
  const [result, setResult] = useState<PublicLiveLoadResult>(initial);
  const [reloadVersion, setReloadVersion] = useState(0);
  const reload = useCallback(() => setReloadVersion((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    if (mode === 'prototype') {
      import('./publicPrototypeDataSource').then(({ loadPublicPrototypeSnapshot }) => {
        if (active) setResult(loadPublicPrototypeSnapshot());
      });
      return () => { active = false; };
    }
    setResult(initial);
    loadPublicLiveSnapshot(locale).then((next) => { if (active) setResult(next); });
    return () => { active = false; };
  }, [mode, locale, reloadVersion]);
  return { mode, ...result, reload };
}
