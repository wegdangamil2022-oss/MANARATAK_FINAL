import { useCallback, useLayoutEffect, useRef, useState, type SetStateAction } from 'react';
import type { CategoryType, Scholarship, University, Major, Exam, ImportedCourse, PublicArticle, Service, ServiceAudience } from './types';
import type { TabType } from './components/BottomNavBar';

export const initialNavigation = {
  activeTab: 'home' as TabType,
  selectedCategory: 'all' as CategoryType,
  selectedCourseTrack: null as 'imported' | 'native' | 'paid' | null,
  selectedServiceTrack: null as ServiceAudience | null,
  courseNavigationField: '', searchQuery: '', globalSearchQuery: '',
  isSmartSearchOpen: false, selectedCountry: 'الكل', selectedDegree: 'الكل',
  onlyFullyFunded: false, onlyWithoutIelts: false,
  selectedScholarship: null as Scholarship | null,
  selectedUniversity: null as University | null,
  selectedMajor: null as Major | null,
  selectedExam: null as Exam | null,
  selectedImportedCourse: null as ImportedCourse | null,
  selectedArticle: null as PublicArticle | null,
  selectedService: null as Service | null,
  serviceReturnTab: null as TabType | null,
  favoriteLaunch: null as {kind: 'country' | 'tool' | 'career'; id?: string} | null,
  countryNavigationName: '', examNavigationQuery: '',
  auxiliaryPage: null as 'faq' | 'contact' | 'language' | null,
  nestedDetailId: '',
};
export type NavigationState = typeof initialNavigation;
const detailKeys = ['selectedScholarship', 'selectedUniversity', 'selectedMajor', 'selectedExam', 'selectedImportedCourse', 'selectedArticle', 'selectedService'] as const;
const emptyDetails = Object.fromEntries(detailKeys.map(key => [key, null]));
type Entry = {version: 29; index: number; route: NavigationState; scroll: number};
function readEntry(): Entry | null {
  const entry = window.history.state?.manaratakPublic;
  return entry?.version === 29 && typeof entry.index === 'number' && entry.route?.activeTab
    ? entry : null;
}
export function routeKey(state: NavigationState) {
  return JSON.stringify([state.activeTab, state.selectedCategory, state.selectedCourseTrack,
    state.selectedServiceTrack, state.isSmartSearchOpen, state.auxiliaryPage,
    state.nestedDetailId, state.countryNavigationName,
    ...detailKeys.map(key => state[key]?.id || null)]);
}

/** Public preview navigation. History contains only public view data, never form documents or credentials. */
export function usePublicNavigation() {
  const [state, setState] = useState<NavigationState>(() => ({...initialNavigation, ...readEntry()?.route}));
  const current = useRef<Entry | null>(readEntry());
  const restoring = useRef<Entry | null>(current.current);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const pop = () => {
      const entry = readEntry();
      if (!entry) return; // Leave navigation outside this public template to its host router.
      restoring.current = entry;
      setState({...initialNavigation, ...entry.route});
    };
    const scroll = () => {
      if (current.current) current.current.scroll = window.scrollY;
    };
    const persist = () => {
      if (current.current) history.replaceState({...history.state, manaratakPublic: current.current}, '');
    };
    window.addEventListener('popstate', pop);
    window.addEventListener('scroll', scroll, {passive: true});
    window.addEventListener('pagehide', persist);
    return () => {
      history.scrollRestoration = previousRestoration;
      window.removeEventListener('popstate', pop);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pagehide', persist);
    };
  }, []);

  useLayoutEffect(() => {
    const restored = restoring.current;
    restoring.current = null;
    const changed = current.current && routeKey(current.current.route) !== routeKey(state);
    let entry: Entry;
    if (restored) {
      entry = {...restored, route: state};
    } else if (changed && mounted.current) {
      history.replaceState({...history.state, manaratakPublic: current.current}, '');
      entry = {version: 29, index: current.current!.index + 1, route: state, scroll: 0};
      history.pushState({...history.state, manaratakPublic: entry}, '');
    } else {
      entry = {version: 29, index: current.current?.index || 0, route: state, scroll: current.current?.scroll || 0};
    }
    current.current = entry;
    history.replaceState({...history.state, manaratakPublic: entry}, '');
    mounted.current = true;
    if (changed || restored) {
      const scrollTop = restored ? restored.scroll : 0;
      window.scrollTo({top: scrollTop, behavior: 'instant'});
      const frame = requestAnimationFrame(() => {
        window.scrollTo({top: scrollTop, behavior: 'instant'});
        const heading = document.querySelector<HTMLElement>('main h1, main h2');
        if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [state]);

  const setField = useCallback(<K extends keyof NavigationState>(key: K, value: SetStateAction<NavigationState[K]>) => {
    setState(previous => {
      const next = typeof value === 'function'
        ? (value as (old: NavigationState[K]) => NavigationState[K])(previous[key]) : value;
      // A new entity replaces the displayed entity. The previous one lives in browser history.
      const clear = detailKeys.includes(key as typeof detailKeys[number]) && next != null;
      return {...previous,
        ...(key === 'selectedCategory' && next !== previous.selectedCategory ? {nestedDetailId: '', auxiliaryPage: null} : {}),
        ...(clear ? {...emptyDetails, auxiliaryPage: null, isSmartSearchOpen: false, nestedDetailId: ''} : {}), [key]: next};
    });
  }, []);
  const field = <K extends keyof NavigationState>(key: K): [NavigationState[K], (value: SetStateAction<NavigationState[K]>) => void] =>
    [state[key], value => setField(key, value)];
  const navigate = useCallback((patch: Partial<NavigationState>) => {
    setState(previous => ({...initialNavigation, globalSearchQuery: previous.globalSearchQuery, ...patch}));
  }, []);
  const back = useCallback(() => {
    if ((current.current?.index || 0) > 0) history.back();
    else navigate({activeTab: 'home'});
  }, [navigate]);
  return {state, field, navigate, back};
}

