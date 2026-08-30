import React, { useState, useEffect } from 'react';
import './template.css';
import {readStored, writeStored, readStoredArray} from './storage';
import { usePublicNavigation } from './usePublicNavigation';
import { PublicInfoPage } from './components/PublicInfoPage';
import { CourseTrackPreview } from './components/CourseTrackPreview';
import {
  Scholarship,
  University,
  Course,
  Major,
  ApplicationMilestone,
  PushNotificationItem,
  UserProfile,
  Language,
  CategoryType,
  Exam,
  ImportedCourse,
  PublicArticle,
  Service,
  ServiceAudience,
  FavoriteKey,
  FavoriteKind,
} from './types';
import {
  INITIAL_SCHOLARSHIPS,
  MOCK_UNIVERSITIES,
  MOCK_COURSES,
  MOCK_MAJORS,
  INITIAL_MILESTONES,
  INITIAL_NOTIFICATIONS,
  MOCK_EXAMS,
  MOCK_COUNTRIES,
  GOLDEN_IMPORTED_COURSES,
} from './data/mockData';
import { GOLDEN_ARTICLES } from './data/articleData';
import { PUBLIC_SERVICES } from './data/serviceData';
import { Header } from './components/Header';
import { SmartSearchBar } from './components/SmartSearchBar';
import { GlobalSearchPage } from './components/GlobalSearchPage';
import { FavoritesPage } from './components/FavoritesPage';
import { SmartSearchPage } from './components/SmartSearchPage';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { FeaturedScholarships } from './components/FeaturedScholarships';
import { ScholarshipsSearchPage } from './components/ScholarshipsSearchPage';
import { CountriesSearchPage } from './components/CountriesSearchPage';
import { AIToolsPage } from './components/AIToolsPage';
import { ExamsSearchPage } from './components/ExamsSearchPage';
import { CoursesLandingPage } from './components/CoursesLandingPage';
import { CoursesSearchPage } from './components/CoursesSearchPage';
import { ImportedCourseDetail } from './components/ImportedCourseDetail';
import { AIToolsBanner } from './components/AIToolsBanner';
import { FeaturedUniversities } from './components/FeaturedUniversities';
import { FeaturedCountries } from './components/FeaturedCountries';
import { FeaturedMajors } from './components/FeaturedMajors';
import { FeaturedCourses } from './components/FeaturedCourses';
import { FeaturedExams } from './components/FeaturedExams';
import { FeaturedJobs } from './components/FeaturedJobs';
import { CareersSearchPage } from './components/CareersSearchPage';
import { FeaturedArticles } from './components/FeaturedArticles';
import { ArticlesSearchPage } from './components/ArticlesSearchPage';
import { ArticleDetail } from './components/ArticleDetail';
import { FeaturedServices } from './components/FeaturedServices';
import { ServicesLandingPage } from './components/ServicesLandingPage';
import { ServicesDirectoryPage } from './components/ServicesDirectoryPage';
import { ServiceDetail } from './components/ServiceDetail';
import { RoadmapPreview } from './components/RoadmapPreview';
import { FaqPreview } from './components/FaqPreview';
import { ContactSection } from './components/ContactSection';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { LearnerProgressTracker } from './components/LearnerProgressTracker';
import { AIToolsModal } from './components/AIToolsModal';
import { PushNotificationCenter } from './components/PushNotificationCenter';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { MajorDetailModal } from './components/MajorDetailModal';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import { ExamDetailModal } from './components/ExamDetailModal';
import { UniversitiesList } from './components/UniversitiesList';
import { CoursesList } from './components/CoursesList';
import { MajorsSearchPage } from './components/MajorsSearchPage';
import { UniversitiesSearchPage } from './components/UniversitiesSearchPage';
import { NavigationDrawer } from './components/NavigationDrawer';
import { AuthPage } from './components/AuthPage';
import { StudentWorkspacePage } from './components/StudentWorkspacePage';
import {
  Filter,
  SlidersHorizontal,
  Sparkles,
  Heart,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Search,
  ArrowUpDown,
} from 'lucide-react';

export default function App() {
  const navigation = usePublicNavigation();
  const { back: goBack, navigate } = navigation;
  // UI States
  const [activeTab, setActiveTab] = navigation.field('activeTab');
  const [selectedCategory, setSelectedCategory] = navigation.field('selectedCategory');
  const [selectedCourseTrack, setSelectedCourseTrack] = navigation.field('selectedCourseTrack');
  const [selectedServiceTrack, setSelectedServiceTrack] = navigation.field('selectedServiceTrack');
  const [courseNavigationField, setCourseNavigationField] = navigation.field('courseNavigationField');
  const language: Language = 'ar'; // English is explicitly unavailable until the full UI is translated.
  useEffect(() => {
    if (selectedCategory !== 'courses') {
      setSelectedCourseTrack(null);
      setCourseNavigationField('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== 'services') {
      setSelectedServiceTrack(null);
    }
  }, [selectedCategory]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = readStored('manaratak_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = navigation.field('searchQuery');
  const [globalSearchQuery, setGlobalSearchQuery] = navigation.field('globalSearchQuery');
  const [isSmartSearchOpen, setIsSmartSearchOpen] = navigation.field('isSmartSearchOpen');
  const [selectedCountry, setSelectedCountry] = navigation.field('selectedCountry');
  const [selectedDegree, setSelectedDegree] = navigation.field('selectedDegree');
  const [onlyFullyFunded, setOnlyFullyFunded] = navigation.field('onlyFullyFunded');
  const [onlyWithoutIelts, setOnlyWithoutIelts] = navigation.field('onlyWithoutIelts');

  // Data States with LocalStorage Persistence
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    return readStoredArray<Scholarship>('manaratak_scholarships', INITIAL_SCHOLARSHIPS);
  });

  const [milestones, setMilestones] = useState<ApplicationMilestone[]>(() => {
    return readStoredArray<ApplicationMilestone>('manaratak_milestones', INITIAL_MILESTONES);
  });

  const [favoriteKeys, setFavoriteKeys] = useState<FavoriteKey[]>(() => {
    const savedV2 = readStored('manaratak_favorites_v2');
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed)) return [...new Set(parsed.filter((item): item is FavoriteKey => typeof item === 'string' && /^(scholarship|university|major|country|course|exam|article|service|tool|career):.+$/.test(item)))];
      } catch (_) {
        // Fall through to legacy migration.
      }
    }

    const legacy = readStored('manaratak_favorites');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === 'string').map((id) => `scholarship:${id}` as FavoriteKey);
      } catch (_) {
        // Ignore malformed legacy storage.
      }
    }

    return ['scholarship:csc-china', 'scholarship:chevening-uk'];
  });

  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() => {
    return readStoredArray<PushNotificationItem>('manaratak_notifications', INITIAL_NOTIFICATIONS).filter((item, index, list) => !item.title.includes('مرحباً بك في منصة منارتك') || list.findIndex(candidate => candidate.title.includes('مرحباً بك في منصة منارتك')) === index).map(item => item.title.includes('مرحباً بك في منصة منارتك') ? {...item, id: 'welcome-v29', actionType: undefined, targetId: undefined, body: 'هذه معاينة محلية للإشعارات. ستُفعّل التنبيهات الحقيقية بعد ربط الخدمة.'} : item);
  });

  // Modal Dialogs
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAiToolsOpen, setIsAiToolsOpen] = useState<boolean>(false);
  const [aiToolsInitialTab, setAiToolsInitialTab] = useState<'letter' | 'cv' | 'chat' | 'search'>(
    'letter',
  );
  const [presetAiScholarship, setPresetAiScholarship] = useState<string>('');
  const [selectedScholarship, setSelectedScholarship] = navigation.field('selectedScholarship');
  const [selectedMajor, setSelectedMajor] = navigation.field('selectedMajor');
  const [selectedUniversity, setSelectedUniversity] = navigation.field('selectedUniversity');
  const [selectedExam, setSelectedExam] = navigation.field('selectedExam');
  const [selectedImportedCourse, setSelectedImportedCourse] = navigation.field('selectedImportedCourse');
  const [selectedArticle, setSelectedArticle] = navigation.field('selectedArticle');
  const [selectedService, setSelectedService] = navigation.field('selectedService');
  const [serviceReturnTab, setServiceReturnTab] = navigation.field('serviceReturnTab');
  const [favoriteLaunch, setFavoriteLaunch] = navigation.field('favoriteLaunch');
  const [countryNavigationName, setCountryNavigationName] = navigation.field('countryNavigationName');
  const [examNavigationQuery, setExamNavigationQuery] = navigation.field('examNavigationQuery');
  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);

  const openSection = (target: string) => {
    setIsMenuOpen(false);
    setIsNotificationOpen(false);
    setIsAiToolsOpen(false);
    if (['scholarships','universities','countries','majors','courses','exams','articles','services','jobs'].includes(target)) {
      navigate({activeTab: 'search', selectedCategory: target as CategoryType});
    } else if (target === 'tools' || target === 'ai-tools') {
      navigate({activeTab: 'ai-tools'});
    } else if (target === 'all' || target === 'search') {
      navigate({activeTab: 'search'});
    } else {
      navigate({activeTab: target === 'home' ? 'home' : target as TabType});
    }
  };
  const openLanguage = () => {
    setIsMenuOpen(false);
    navigate({auxiliaryPage: 'language'});
  };
  // Close overlays when the user navigates with browser Back/Forward.
  useEffect(() => {
    const close = () => {setIsMenuOpen(false); setIsNotificationOpen(false); setIsAiToolsOpen(false);};
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  // Sync Dark Mode Class to HTML and Body
  useEffect(() => {
    writeStored('manaratak_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save to LocalStorage
  useEffect(() => {
    writeStored('manaratak_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    writeStored('manaratak_favorites_v2', JSON.stringify(favoriteKeys));
  }, [favoriteKeys]);

  useEffect(() => {
    writeStored('manaratak_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle document direction on language change
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Instant Push Notification Chime Sound Helper
  const playPushNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Trigger Interactive Push Notification Simulation
  const triggerInstantPush = (customNotification?: Partial<PushNotificationItem>) => {
    const newAlert: PushNotificationItem = {
      id: customNotification?.id || `push-${Date.now()}`,
      title: customNotification?.title || 'تنبيه تجريبي من منارتك',
      body:
        customNotification?.body ||
        'هذا اختبار محلي لعرض الإشعارات، وليس إعلانًا عن فرصة حقيقية.',
      timestamp: 'الآن',
      type: customNotification?.type || 'system',
      read: false,
      actionType: customNotification?.actionType,
      targetId: customNotification?.targetId,
    };

    setNotifications((prev) => [newAlert, ...prev]);
    setActiveToast(newAlert);
    playPushNotificationSound();

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === newAlert.id ? null : curr));
    }, 6000);
  };

  // Initial welcome push after 2.5 seconds
  useEffect(() => {
    if (notifications.some(item => item.id === 'welcome-v29' || item.title.includes('مرحباً بك في منصة منارتك'))) return;
    const timer = setTimeout(() => {
      setNotifications(previous => previous.some(item => item.id === 'welcome-v29') ? previous : [{
        id: 'welcome-v29', timestamp: 'الآن', read: false,
        title: '🔔 مرحباً بك في منصة منارتك للفرص التعليمية!',
        body: 'هذه معاينة محلية للإشعارات. ستُفعّل التنبيهات الحقيقية بعد ربط الخدمة.',
        type: 'system',
      }, ...previous]);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Deadline 3-day Local Notification Check (نظام متابعة تقدم المتعلمين)
  useEffect(() => {
    if (!milestones.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    milestones.forEach((m, index) => {
      if (!m.deadline) return;

      const deadlineDate = new Date(m.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger if exactly 3 days left
      if (diffDays === 3) {
        const alreadyNotified = notifications.some(
          (n) => n.type === 'deadline' && n.targetId === m.scholarshipId,
        );

        if (!alreadyNotified) {
          timers.push(setTimeout(
            () => {
              triggerInstantPush({
                title: '⏳ تنبيه الموعد النهائي: 3 أيام متبقية!',
                body: `باقي 3 أيام فقط على إغلاق التقديم لمنحة ${m.scholarshipTitle}. تأكد من إكمال جميع المتطلبات في نظام المتابعة.`,
                type: 'deadline',
                actionType: 'tracker',
                targetId: m.scholarshipId,
              });
            },
            index * 1000 + 3500,
          )); // Stagger if multiple, run after initial welcome push
        }
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [milestones, notifications]);

  const makeFavoriteKey = (kind: FavoriteKind, id: string): FavoriteKey => `${kind}:${id}` as FavoriteKey;

  const favoriteIdsFor = (kind: FavoriteKind): string[] => {
    const prefix = `${kind}:`;
    return favoriteKeys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length));
  };

  const isFavorite = (kind: FavoriteKind, id: string) => favoriteKeys.includes(makeFavoriteKey(kind, id));

  // Toggle a typed favorite. Entity type is part of the key to prevent cross-domain ID collisions.
  const handleToggleFavorite = (kind: FavoriteKind, id: string) => {
    const key = makeFavoriteKey(kind, id);
    setFavoriteKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  // Add scholarship to learner progress tracker
  const handleAddToTracker = (sch: Scholarship) => {
    const exists = milestones.some((m) => m.scholarshipId === sch.id);
    if (exists) {
      setActiveTab('tracker');
      setSelectedScholarship(null);
      return;
    }

    const newMilestone: ApplicationMilestone = {
      id: `track-${Date.now()}`,
      scholarshipId: sch.id,
      scholarshipTitle: sch.title,
      country: sch.country,
      deadline: sch.deadline,
      stage: 'تجهيز المستندات',
      progress: 0,
      notes: `بدء إعداد ملف التقديم الرسمي لمنحة ${sch.title}`,
      checklist: [
        {
          id: `c-${Date.now()}-1`,
          task: 'ترجمة وتصديق كشف العلامات وشهادة التخرج',
          completed: false,
        },
        { id: `c-${Date.now()}-2`, task: 'تجهيز السيرة الذاتية بصيغة أكاديمية', completed: false },
        {
          id: `c-${Date.now()}-3`,
          task: 'صياغة خطاب الدافع بواسطة الذكاء الاصطناعي',
          completed: false,
        },
        { id: `c-${Date.now()}-4`, task: 'الحصول على خطابات التوصية الأكاديمية', completed: false },
        {
          id: `c-${Date.now()}-5`,
          task: 'تقديم الطلب الإلكتروني على البوابة الرسمية',
          completed: false,
        },
      ],
    };

    setMilestones((prev) => [newMilestone, ...prev]);
    setSelectedScholarship(null);
    setActiveTab('tracker');

    triggerInstantPush({
      title: '🎯 تمت إضافة المنحة لنظام متابعة تقدمك',
      body: `تم إدراج ${sch.title} في قائمة المتابعة لتتبع مهام ومواعيد التقديم.`,
      type: 'opportunity',
      actionType: 'tracker',
    });
  };

  // Filter scholarships logic
  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = selectedCountry === 'الكل' || s.country === selectedCountry;
    const matchesDegree =
      selectedDegree === 'الكل' || s.degreeLevel.includes(selectedDegree as any);
    const matchesFunding = !onlyFullyFunded || s.fundingType === 'ممولة بالكامل';
    const matchesIelts = !onlyWithoutIelts || s.withoutIelts;

    return matchesSearch && matchesCountry && matchesDegree && matchesFunding && matchesIelts;
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const favoriteTypeCounts = favoriteKeys.reduce<Partial<Record<FavoriteKind, number>>>((counts, key) => {
    const kind = key.split(':', 1)[0] as FavoriteKind;
    counts[kind] = (counts[kind] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="manaratak-public flex flex-col min-h-screen w-full bg-[var(--mn-page)] text-[var(--mn-text)] selection:bg-[var(--mn-accent)]/30 selection:text-[var(--mn-heading)] font-['Cairo',sans-serif] pb-24 sm:pb-28 transition-colors mn-panel ">
      {/* App Header (Top Sticky) */}
      <Header
        language={language}
        onToggleLanguage={openLanguage}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenProfile={() => openSection('account')}
        unreadCount={unreadNotificationsCount}
        activeTab={activeTab}
        onTabChange={openSection}
        selectedCategory={selectedService ? 'services' : selectedCategory}
        globalSearchQuery={globalSearchQuery}
        onGlobalSearchChange={setGlobalSearchQuery}
        onGlobalSearchSubmit={(query) => navigate({activeTab: 'search', globalSearchQuery: query})}
        onOpenSmartSearch={(query) => navigate({activeTab: 'search', globalSearchQuery: query, isSmartSearchOpen: true})}
        onSelectCategory={(category) => openSection(category === 'all' ? 'home' : category)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="w-full mx-auto transition-all flex-1 flex flex-col">
        {navigation.state.auxiliaryPage ? (
          <PublicInfoPage page={navigation.state.auxiliaryPage} onBack={goBack} onServices={() => openSection('services')} />
        ) : isSmartSearchOpen ? (
          <SmartSearchPage
            initialQuery={globalSearchQuery}
            onQueryChange={setGlobalSearchQuery}
            scholarships={scholarships}
            onBack={goBack}
            onOpenNormalSearch={(query) => {
              setGlobalSearchQuery(query);
              setIsSmartSearchOpen(false);
              setSelectedCategory('all');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(item) => {
              setIsSmartSearchOpen(false);
              setSelectedScholarship(item);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenUniversity={(item) => {
              setIsSmartSearchOpen(false);
              setSelectedUniversity(item);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onNavigateCategory={(category) => {
              setIsSmartSearchOpen(false);
              setSelectedCategory(category);
              setActiveTab(category === 'tools' ? 'ai-tools' : 'search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedService ? (
          <ServiceDetail
            service={selectedService}
            isFavorite={isFavorite('service', selectedService.id)}
            onToggleFavorite={(id) => handleToggleFavorite('service', id)}
            onBack={goBack}
            onOpenContext={(category) => {
              setSelectedService(null);
              setSelectedServiceTrack(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedExam(null);
              setSelectedArticle(null);
              setSelectedImportedCourse(null);
              setSearchQuery('');
              setCountryNavigationName('');
              setExamNavigationQuery('');
              setSelectedCategory(category);
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            isFavorite={isFavorite('article', selectedArticle.id)}
            onToggleFavorite={(id) => handleToggleFavorite('article', id)}
            onBack={goBack}
            onOpenScholarship={(id) => {
              const scholarship = scholarships.find((item) => item.id === id);
              if (!scholarship) return;
              setSelectedArticle(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedExam(null);
              setSelectedImportedCourse(null);
              setSelectedScholarship(scholarship);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenUniversity={(id) => {
              const university = MOCK_UNIVERSITIES.find((item) => item.id === id);
              if (!university) return;
              setSelectedArticle(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedExam(null);
              setSelectedImportedCourse(null);
              setSelectedUniversity(university);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCountry={(name) => {
              setSelectedArticle(null);
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedExam(null);
              setSelectedImportedCourse(null);
              setCountryNavigationName(name);
              setSelectedCategory('countries');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenMajor={(id) => {
              const major = MOCK_MAJORS.find((item) => item.id === id);
              if (!major) return;
              setSelectedArticle(null);
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedExam(null);
              setSelectedImportedCourse(null);
              setSelectedMajor(major);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenExam={(id) => {
              const exam = MOCK_EXAMS.find((item) => item.id === id);
              if (!exam) return;
              setSelectedArticle(null);
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedImportedCourse(null);
              setSelectedExam(exam);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCourse={(id) => {
              const course = GOLDEN_IMPORTED_COURSES.find((item) => item.id === id);
              if (!course) return;
              setSelectedArticle(null);
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedExam(null);
              setSelectedImportedCourse(course);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedScholarship ? (
          <ScholarshipDetailModal
            scholarship={selectedScholarship}
            onClose={goBack}
            onToggleFavorite={(id) => handleToggleFavorite('scholarship', id)}
            isFavorite={isFavorite('scholarship', selectedScholarship.id)}
            onAddToTracker={handleAddToTracker}
            onOpenAiLetter={(title) => {
              setPresetAiScholarship(title);
              setAiToolsInitialTab('letter');
              setIsAiToolsOpen(true);
            }}
            onOpenUniversity={(universityId) => {
              const university = MOCK_UNIVERSITIES.find((item) => item.id === universityId);
              if (!university) return;
              setSelectedScholarship(null);
              setSelectedUniversity(university);
            }}
            onOpenMajor={(majorId) => {
              const major = MOCK_MAJORS.find((item) => item.id === majorId);
              if (!major) return;
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(major);
            }}
            onOpenCountry={(countryName) => {
              setCountryNavigationName(countryName);
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedCategory('countries');
              setActiveTab('search');
            }}
            onOpenExam={(examId) => {
              const exam = MOCK_EXAMS.find((item) => item.id === examId);
              if (!exam) return;
              setSelectedScholarship(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedExam(exam);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(scholarshipId) => {
              const related = scholarships.find((item) => item.id === scholarshipId);
              if (!related) return;
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedScholarship(related);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenArticle={(articleId) => {
              const article = GOLDEN_ARTICLES.find((item) => item.id === articleId);
              if (!article) return;
              setSelectedScholarship(null);
              setSelectedArticle(article);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedUniversity ? (
          <UniversityDetailModal
            university={selectedUniversity}
            onClose={goBack}
            isSaved={isFavorite('university', selectedUniversity.id)}
            onToggleSave={(e) => {
              e.stopPropagation();
              handleToggleFavorite('university', selectedUniversity.id);
            }}
            onOpenCountry={(countryName) => {
              setCountryNavigationName(countryName);
              setSearchQuery(countryName);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedCategory('countries');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenMajor={(majorId) => {
              const relatedMajor = MOCK_MAJORS.find((item) => item.id === majorId);
              if (!relatedMajor) return;
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(relatedMajor);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(scholarshipId) => {
              const related = scholarships.find((item) => item.id === scholarshipId);
              if (!related) return;
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedScholarship(related);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenExam={(examId) => {
              const exam = MOCK_EXAMS.find((item) => item.id === examId);
              if (!exam) return;
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedExam(exam);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenArticle={(articleId) => {
              const article = GOLDEN_ARTICLES.find((item) => item.id === articleId);
              if (!article) return;
              setSelectedUniversity(null);
              setSelectedArticle(article);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            contextualServices={PUBLIC_SERVICES}
            onOpenService={(service) => {
              // Keep the university selected underneath the service detail so Back returns
              // to the originating university context instead of losing the navigation origin.
              setServiceReturnTab(null);
              setSelectedServiceTrack(service.audience);
              setSelectedService(service);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedMajor ? (
          <MajorDetailModal
            major={selectedMajor}
            isFavorite={isFavorite('major', selectedMajor.id)}
            onToggleFavorite={(id) => handleToggleFavorite('major', id)}
            onClose={goBack}
            onOpenUniversity={(universityId) => {
              const university = MOCK_UNIVERSITIES.find((item) => item.id === universityId);
              if (!university) return;
              setSelectedMajor(null);
              setSelectedScholarship(null);
              setSelectedUniversity(university);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(scholarshipId) => {
              const related = scholarships.find((item) => item.id === scholarshipId);
              if (!related) return;
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(related);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCourse={(courseKey) => {
              const importedCourse = GOLDEN_IMPORTED_COURSES.find((item) => item.id === courseKey);
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(null);

              if (importedCourse) {
                setSelectedImportedCourse(importedCourse);
                window.scrollTo({ top: 0, behavior: 'instant' });
                return;
              }

              setSearchQuery(courseKey);
              setCourseNavigationField('');
              setSelectedCourseTrack('imported');
              setSelectedCategory('courses');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCourseCollection={(field) => {
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(null);
              setSelectedImportedCourse(null);
              setSearchQuery('');
              setCourseNavigationField(field);
              setSelectedCourseTrack('imported');
              setSelectedCategory('courses');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenMajor={(majorId) => {
              const relatedMajor = MOCK_MAJORS.find((item) => item.id === majorId);
              if (!relatedMajor) return;
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(relatedMajor);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCountry={(countryName) => {
              setCountryNavigationName(countryName);
              setSearchQuery(countryName);
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(null);
              setSelectedCategory('countries');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedImportedCourse ? (
          <ImportedCourseDetail
            course={selectedImportedCourse}
            isFavorite={isFavorite('course', selectedImportedCourse.id)}
            onToggleFavorite={(id) => handleToggleFavorite('course', id)}
            onBack={goBack}
            onOpenMajor={(majorId) => {
              const major = MOCK_MAJORS.find((item) => item.id === majorId);
              if (!major) return;
              setSelectedImportedCourse(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(null);
              setSelectedMajor(major);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenUniversity={(universityId) => {
              const university = MOCK_UNIVERSITIES.find((item) => item.id === universityId);
              if (!university) return;
              setSelectedImportedCourse(null);
              setSelectedMajor(null);
              setSelectedScholarship(null);
              setSelectedExam(null);
              setSelectedUniversity(university);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(scholarshipId) => {
              const scholarship = scholarships.find((item) => item.id === scholarshipId);
              if (!scholarship) return;
              setSelectedImportedCourse(null);
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedExam(null);
              setSelectedScholarship(scholarship);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCountry={(countryName) => {
              setCountryNavigationName(countryName);
              setSelectedImportedCourse(null);
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(null);
              setSelectedCategory('countries');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenExam={(examId) => {
              const exam = MOCK_EXAMS.find((item) => item.id === examId);
              if (!exam) return;
              setSelectedImportedCourse(null);
              setSelectedMajor(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedExam(exam);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedExam ? (
          <ExamDetailModal
            exam={selectedExam}
            isFavorite={isFavorite('exam', selectedExam.id)}
            onToggleFavorite={(id) => handleToggleFavorite('exam', id)}
            onClose={goBack}
            onOpenUniversity={(universityId) => {
              const university = MOCK_UNIVERSITIES.find((item) => item.id === universityId);
              if (!university) return;
              setSelectedExam(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedUniversity(university);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenScholarship={(scholarshipId) => {
              const scholarship = scholarships.find((item) => item.id === scholarshipId);
              if (!scholarship) return;
              setSelectedExam(null);
              setSelectedUniversity(null);
              setSelectedMajor(null);
              setSelectedScholarship(scholarship);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenCountry={(countryName) => {
              setCountryNavigationName(countryName);
              setSearchQuery(countryName);
              setSelectedExam(null);
              setSelectedUniversity(null);
              setSelectedScholarship(null);
              setSelectedMajor(null);
              setSelectedCategory('countries');
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onOpenArticle={(articleId) => {
              const article = GOLDEN_ARTICLES.find((item) => item.id === articleId);
              if (!article) return;
              setSelectedExam(null);
              setSelectedArticle(article);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : (
          <>
            {/* TAB 1: HOME VIEW (Exactly as in Reference Screenshot) */}
            {activeTab === 'home' && selectedCategory === 'all' && (
              <div className="flex flex-col items-center w-full px-3 sm:px-4 pt-2 sm:pt-3">
                <div className="w-full space-y-1">
                  {/* Global Search + Smart Search now live persistently in the Header. */}
                  {/* Hero Banner matching Mockup */}
                  <HeroBanner
                    onExploreClick={() => {
                      setActiveTab('search');
                      setSelectedCategory('scholarships');
                    }}
                    onOpenAiHelper={() => {
                      setAiToolsInitialTab('chat');
                      setIsAiToolsOpen(true);
                    }}
                  />

                  {/* 3. Category Icons matching Mockup */}
                  <CategoryNav
                    selectedCategory={selectedCategory}
                    onSelectCategory={openSection}
                  />
                </div>

                {/* --- Timeline Container for All Sections --- */}
                <div className="w-full relative mt-2 pb-4">
                  {/* 🌟 The Glowing Scroll Track (Yellow line only) pushed to exact right edge */}
                  <div className="absolute right-0 sm:-right-2 top-8 bottom-12 w-[3px] z-0">
                    <div className="sticky top-1/2 w-full h-24 -mt-12 bg-gradient-to-b from-transparent via-[var(--mn-accent-soft)]/80 to-transparent rounded-full animate-pulse-subtle shadow-[0_0_8px_rgba(214,164,59,0.6)]"></div>
                  </div>

                  <div className="space-y-5 relative z-10 w-full px-1 sm:px-2">
                    {/* 1. Featured Scholarships */}
                    <div className="relative w-full">
                      <FeaturedScholarships
                        scholarships={scholarships}
                        onSelectScholarship={(s) => setSelectedScholarship(s)}
                        onToggleFavorite={(id) => handleToggleFavorite('scholarship', id)}
                        favoriteIds={favoriteIdsFor('scholarship')}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('scholarships');
                        }}
                      />
                    </div>

                    {/* 2. Featured Majors */}
                    <div className="relative w-full">
                      <FeaturedMajors
                        majors={MOCK_MAJORS}
                        onSelectMajor={(major) => {
                          setSearchQuery(major.name);
                          setActiveTab('search');
                          setSelectedCategory('majors');
                        }}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('majors');
                        }}
                      />
                    </div>

                    {/* 3. Featured Universities */}
                    <div className="relative w-full">
                      <FeaturedUniversities
                        universities={MOCK_UNIVERSITIES}
                        onSelectUniversity={(uni) => {
                          setSelectedUniversity(uni);
                        }}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('universities');
                        }}
                      />
                    </div>

                    {/* 4. Featured Countries */}
                    <div className="relative w-full">
                      <FeaturedCountries
                        onSelectCountry={(name) => navigate({activeTab: 'search', selectedCategory: 'countries', countryNavigationName: name})}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('countries');
                        }}
                      />
                    </div>

                    {/* 5. AI Tools Section */}
                    <div className="relative w-full">
                      <AIToolsBanner onOpenAiTools={() => setActiveTab('ai-tools')} />
                    </div>

                    {/* 6. Roadmap Preview */}
                    <div className="relative w-full pb-2">
                      <RoadmapPreview onOpen={() => openSection('tracker')} />
                    </div>

                    {/* 7. Featured Exams */}
                    <div className="relative w-full">
                      <FeaturedExams
                        exams={MOCK_EXAMS}
                        onSelectExam={setSelectedExam}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('exams');
                        }}
                      />
                    </div>

                    {/* 8. Featured Courses */}
                    <div className="relative w-full">
                      <FeaturedCourses
                        courses={MOCK_COURSES}
                        onSelectCourse={(course) => {const imported = GOLDEN_IMPORTED_COURSES.find(item => item.id === course.id); if(imported) setSelectedImportedCourse(imported); else navigate({activeTab: 'search', selectedCategory: 'courses', selectedCourseTrack: course.provider.includes('منارتك') ? 'native' : 'imported'});}}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('courses');
                        }}
                      />
                    </div>

                    {/* 9. Featured Jobs & Internships */}
                    <div className="relative w-full">
                      <FeaturedJobs
                        onViewAllClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('jobs');
                          setActiveTab('search');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                      />
                    </div>

                    {/* 10. Featured Articles (Magazine Style) */}
                    <div className="relative w-full">
                      <FeaturedArticles
                  onSelectArticle={(id) => {
                    const article = GOLDEN_ARTICLES.find(item => item.id === id);
                    if (article) setSelectedArticle(article); else openSection('articles');
                  }}
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('articles');
                          setSearchQuery('');
                        }}
                      />
                    </div>

                    {/* 11. Featured Services (Students & General Support) */}
                    <div className="relative w-full pb-2">
                      <FeaturedServices
                        onViewAllClick={() => {
                          setSelectedServiceTrack(null);
                          setSearchQuery('');
                          setActiveTab('search');
                          setSelectedCategory('services');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        onSelectService={(service) => {
                          setServiceReturnTab(null);
                          setSelectedServiceTrack(service.audience);
                          setSelectedCategory('services');
                          setActiveTab('search');
                          setSelectedService(service);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                      />
                    </div>

                    {/* 12. FAQ Preview */}
                    <div className="relative w-full pb-2">
                      <FaqPreview onOpen={() => navigate({auxiliaryPage: 'faq'})} />
                    </div>

                    {/* 13. Contact & Branches Section */}
                    <div className="relative w-full pb-4">
                      <ContactSection onOpen={() => navigate({auxiliaryPage: 'contact'})} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SEARCH / DIRECTORY VIEW */}
            {activeTab === 'search' && selectedCategory === 'all' ? (
              <GlobalSearchPage
                query={globalSearchQuery}
                scholarships={scholarships}
                onBack={goBack}
                onOpenSmartSearch={() => setIsSmartSearchOpen(true)}
                onOpenScholarship={(item) => setSelectedScholarship(item)}
                onOpenUniversity={(item) => setSelectedUniversity(item)}
                onOpenMajor={(item) => setSelectedMajor(item)}
                onOpenExam={(item) => setSelectedExam(item)}
                onOpenCourse={(item) => setSelectedImportedCourse(item)}
                onOpenArticle={(item) => setSelectedArticle(item)}
                onOpenService={(item) => {
                  setServiceReturnTab(null);
                  setSelectedServiceTrack(item.audience);
                  setSelectedService(item);
                }}
                onOpenCountry={(countryName) => {
                  setCountryNavigationName(countryName);
                  setSelectedCategory('countries');
                  setActiveTab('search');
                }}
                onNavigateCategory={(category) => {
                  setFavoriteLaunch(null);
                  setSelectedCategory(category);
                  setActiveTab(category === 'tools' ? 'ai-tools' : 'search');
                }}
                favoriteKeys={favoriteKeys}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
            selectedCategory === 'scholarships' ? (
              <ScholarshipsSearchPage
                scholarships={scholarships}
                initialCountryName={selectedCountry !== 'الكل' ? selectedCountry : undefined}
                onBack={goBack}
                onSelectScholarship={setSelectedScholarship}
                favoriteIds={favoriteIdsFor('scholarship')}
                onToggleFavorite={(id) => handleToggleFavorite('scholarship', id)}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'majors' ? (
              <MajorsSearchPage
                majors={MOCK_MAJORS}
                favoriteIds={favoriteIdsFor('major')}
                onToggleFavorite={(id) => handleToggleFavorite('major', id)}
                onBack={goBack}
                onSelectMajor={setSelectedMajor}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'countries' ? (
              <CountriesSearchPage detailId={navigation.state.nestedDetailId} onDetailChange={(id) => navigation.field('nestedDetailId')[1](id)}
                countries={MOCK_COUNTRIES}
                initialCountryName={countryNavigationName}
                onBack={goBack}
                onSelectCountryScholarships={(countryName) => {
                  setSelectedCountry(countryName);
                  setCountryNavigationName('');
                  setSelectedCategory('scholarships');
                  setActiveTab('search');
                }}
                onOpenUniversity={(universityId) => {
                  const university = MOCK_UNIVERSITIES.find((item) => item.id === universityId);
                  if (!university) return;
                  setCountryNavigationName('');
                  setSelectedScholarship(null);
                  setSelectedMajor(null);
                  setSelectedUniversity(university);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenScholarship={(scholarshipId) => {
                  const scholarship = scholarships.find((item) => item.id === scholarshipId);
                  if (!scholarship) return;
                  setCountryNavigationName('');
                  setSelectedUniversity(null);
                  setSelectedMajor(null);
                  setSelectedScholarship(scholarship);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenMajor={(majorId) => {
                  const major = MOCK_MAJORS.find((item) => item.id === majorId);
                  if (!major) return;
                  setCountryNavigationName('');
                  setSelectedUniversity(null);
                  setSelectedScholarship(null);
                  setSelectedMajor(major);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenExam={(examId) => {
                  const exam = MOCK_EXAMS.find((item) => item.id === examId);
                  if (!exam) return;
                  setCountryNavigationName('');
                  setSelectedUniversity(null);
                  setSelectedScholarship(null);
                  setSelectedMajor(null);
                  setSelectedExam(exam);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenArticle={(articleId) => {
                  const article = GOLDEN_ARTICLES.find((item) => item.id === articleId);
                  if (!article) return;
                  setCountryNavigationName('');
                  setSelectedArticle(article);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                favoriteIds={favoriteIdsFor('country')}
                onToggleFavorite={(id) => handleToggleFavorite('country', id)}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'universities' ? (
              <UniversitiesSearchPage
                universities={MOCK_UNIVERSITIES}
                favoriteIds={favoriteIdsFor('university')}
                onToggleFavorite={(id) => handleToggleFavorite('university', id)}
                onBack={goBack}
                onSelectUniversity={(uni) => {
                  setSelectedUniversity(uni);
                }}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'exams' ? (
              <ExamsSearchPage
                exams={MOCK_EXAMS}
                initialQuery={examNavigationQuery}
                onBack={goBack}
                onSelectExam={(exam) => {
                  setSelectedExam(exam);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                favoriteIds={favoriteIdsFor('exam')}
                onToggleFavorite={(id) => handleToggleFavorite('exam', id)}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'articles' ? (
              <ArticlesSearchPage
                onBack={goBack}
                onSelectArticle={(article) => {
                  setSelectedArticle(article);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                favoriteIds={favoriteIdsFor('article')}
                onToggleFavorite={(id) => handleToggleFavorite('article', id)}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'jobs' ? (
              <CareersSearchPage detailId={navigation.state.nestedDetailId} onDetailChange={(id) => navigation.field('nestedDetailId')[1](id)}
                onBack={goBack}
                onNavigateCategory={(category) => {
                  setFavoriteLaunch(null);
                  setSelectedCategory(category);
                  setActiveTab('search');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenCountry={(countryName) => {
                  setFavoriteLaunch(null);
                  setCountryNavigationName(countryName);
                  setSelectedCategory('countries');
                  setActiveTab('search');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenTools={() => {
                  setFavoriteLaunch(null);
                  setActiveTab('ai-tools');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                favoriteIds={favoriteIdsFor('career')}
                onToggleFavorite={(id) => handleToggleFavorite('career', id)}
                initialSelectedId={favoriteLaunch?.kind === 'career' ? favoriteLaunch.id : undefined}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'services' ? (
              selectedServiceTrack ? (
                <ServicesDirectoryPage
                  services={PUBLIC_SERVICES}
                  audience={selectedServiceTrack}
                  onBack={goBack}
                  onSelectService={(service) => {
                    setServiceReturnTab(null);
                    setSelectedService(service);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  favoriteIds={favoriteIdsFor('service')}
                  onToggleFavorite={(id) => handleToggleFavorite('service', id)}
                />
              ) : (
                <ServicesLandingPage
                  onBack={goBack}
                  onOpenTrack={(track) => {
                    setSelectedServiceTrack(track);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
              )
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'courses' ? (
              selectedCourseTrack === 'native' || selectedCourseTrack === 'paid' ? (
                <CourseTrackPreview track={selectedCourseTrack} onBack={goBack} onImported={() => setSelectedCourseTrack('imported')} />
              ) : selectedCourseTrack === 'imported' ? (
                <CoursesSearchPage
                  importedCourses={GOLDEN_IMPORTED_COURSES}
                  initialQuery={searchQuery}
                  initialField={courseNavigationField}
                  onSelectCourse={(course) => {
                    setSelectedImportedCourse(course);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  onBack={goBack}
                  favoriteIds={favoriteIdsFor('course')}
                  onToggleFavorite={(id) => handleToggleFavorite('course', id)}
                />
              ) : (
                <CoursesLandingPage
                  onBack={goBack}
                  onOpenTrack={(track) => {setCourseNavigationField(''); setSearchQuery(''); setSelectedCourseTrack(track);}}
                />
              )
            ) : (
              (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) && (
                <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 py-2 sm:pt-3 space-y-3">
                  {/* Search Bar at Top */}
                  <SmartSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelectTag={setSearchQuery}
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                    onOpenAiTools={(tab) => {
                      setAiToolsInitialTab(tab || 'search');
                      setIsAiToolsOpen(true);
                    }}
                  />

                  {/* Category Quick Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'scholarships', label: '🎓 المنح الدراسية' },
                      { id: 'universities', label: '🏛️ الجامعات' },
                      { id: 'exams', label: '📝 الاختبارات' },
                      { id: 'courses', label: '📚 الدورات' },
                      { id: 'majors', label: '💼 التخصصات' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCountryNavigationName('');
                          setExamNavigationQuery('');
                          setSelectedCategory(item.id as any);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedCategory === item.id ||
                          (selectedCategory === 'all' && item.id === 'scholarships')
                            ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] shadow-xs mn-inverse '
                            : 'bg-[var(--mn-surface-muted)] border border-[var(--mn-border)] text-[var(--mn-text)] hover:bg-[var(--mn-page)] mn-panel hover:mn-panel '
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Specific Category View Dispatcher */}
                  {selectedCategory === 'universities' ? (
                    <UniversitiesList universities={MOCK_UNIVERSITIES} onSelectUniversity={setSelectedUniversity} />
                  ) : selectedCategory === 'courses' ? (
                    <CoursesList courses={MOCK_COURSES} />
                  ) : selectedCategory === 'articles' ? (
                    <div className="pt-2">
                      <FeaturedArticles onViewAllClick={() => openSection('articles')} onSelectArticle={id => {
                        const article = GOLDEN_ARTICLES.find(item => item.id === id);
                        if (article) setSelectedArticle(article);
                      }} />
                    </div>
                  ) : selectedCategory === 'services' ? (
                    <div className="pt-2">
                      <FeaturedServices />
                    </div>
                  ) : selectedCategory === 'exams' ? (
                    <div className="pt-2">
                      <FeaturedExams
                        exams={MOCK_EXAMS}
                        onViewAllClick={() => setSelectedCategory('exams')}
                      />
                    </div>
                  ) : selectedCategory === 'jobs' ? (
                    <div className="pt-2">
                      <FeaturedJobs onViewAllClick={() => setSelectedCategory('jobs')} />
                    </div>
                  ) : selectedCategory === 'tools' ? (
                    <div className="pt-2">
                      <AIToolsBanner onOpenAiTools={() => setActiveTab('ai-tools')} />
                    </div>
                  ) : (
                    /* Scholarships Cards List */
                    <div className="space-y-3 pt-1">
                      {/* Results Count & Filter Bar */}
                      <div className="flex items-center justify-between text-xs text-[var(--mn-text-muted)] font-bold px-1">
                        <span>{filteredScholarships.length} فرصة دراسية متاحة</span>
                        <button
                          onClick={() => {
                            setOnlyFullyFunded(!onlyFullyFunded);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            onlyFullyFunded
                              ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)] border-[var(--mn-border-gold)] mn-gold '
                              : 'bg-[var(--mn-surface-muted)] text-[var(--mn-text)] border-[var(--mn-border)] mn-panel '
                          }`}
                        >
                          ⭐ ممولة بالكامل فقط
                        </button>
                      </div>

                      {filteredScholarships.length === 0 ? (
                        <div className="py-16 text-center text-[var(--mn-text-muted)] text-xs space-y-2">
                          <GraduationCap className="w-10 h-10 mx-auto text-[var(--mn-text-muted)]" />
                          <p className="font-bold">لم نجد منحاً تطابق معايير البحث الحالية.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCountry('الكل');
                              setOnlyFullyFunded(false);
                              setOnlyWithoutIelts(false);
                            }}
                            className="px-4 py-1.5 bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] rounded-xl text-xs font-bold mn-inverse "
                          >
                            إعادة ضبط الفلاتر
                          </button>
                        </div>
                      ) : (
                        filteredScholarships.map((sch) => {
                          const isFavorited = isFavorite('scholarship', sch.id);

                          return (
                            <div
                              key={sch.id}
                              onClick={() => setSelectedScholarship(sch)}
                              className="bg-[var(--mn-surface-muted)] rounded-2xl border border-[var(--mn-border)] shadow-xs hover:shadow-md transition-all overflow-hidden p-3.5 space-y-2.5 text-right hover:border-[var(--mn-border-gold)] cursor-pointer active:scale-99 mn-panel "
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <img
                                    src={sch.imageUrl}
                                    alt={sch.title}
                                    className="w-14 h-14 rounded-xl object-cover border border-[var(--mn-border)] shrink-0"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 rounded-full bg-[var(--mn-gold-surface)] text-[var(--mn-heading)] font-black text-[9px] mn-panel ">
                                        {sch.fundingType}
                                      </span>
                                      <span className="text-xs">
                                        {sch.countryFlag} {sch.country}
                                      </span>
                                    </div>
                                    <h3 className="text-xs font-black text-[var(--mn-heading)] mt-1 leading-snug">
                                      {sch.title}
                                    </h3>
                                    <p className="text-[10px] text-[var(--mn-text-muted)] font-semibold mt-0.5">
                                      {sch.university}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite('scholarship', sch.id);
                                  }}
                                  className="p-1.5 text-[var(--mn-text-muted)] hover:text-[var(--mn-accent-text)] rounded-lg"
                                >
                                  <Heart
                                    className={`w-4 h-4 ${
                                      isFavorited
                                        ? 'fill-[var(--mn-accent-soft)] text-[var(--mn-accent-soft)]'
                                        : 'text-[var(--mn-text-muted)]'
                                    }`}
                                  />
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[var(--mn-border)] text-[11px]">
                                <div className="flex items-center gap-2 text-[var(--mn-text-muted)] font-semibold">
                                  <span className="flex items-center gap-1 text-[var(--mn-danger-text)] font-bold">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {sch.daysLeft} يوم متبقي
                                  </span>
                                  <span>•</span>
                                  <span>{sch.degreeLevel.join(', ')}</span>
                                </div>

                                <span className="text-[11px] font-extrabold text-[var(--mn-heading)] flex items-center gap-1">
                                  <span>التفاصيل والشروط</span>
                                  <ChevronLeft className="w-3 h-3 text-[var(--mn-accent-text)]" />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            )}

            {/* TAB 3: FAVORITES VIEW */}
            {activeTab === 'favorites' && (
              <FavoritesPage
                favoriteKeys={favoriteKeys}
                scholarships={scholarships}
                onToggleFavorite={handleToggleFavorite}
                onOpenScholarship={setSelectedScholarship}
                onOpenUniversity={setSelectedUniversity}
                onOpenMajor={setSelectedMajor}
                onOpenCountry={(countryName) => {
                  const country = MOCK_COUNTRIES.find((item) => item.name === countryName || item.nameEn === countryName);
                  setFavoriteLaunch({ kind: 'country', id: country?.id });
                  setCountryNavigationName(countryName);
                  setSelectedCategory('countries');
                  setActiveTab('search');
                }}
                onOpenCourse={setSelectedImportedCourse}
                onOpenExam={setSelectedExam}
                onOpenArticle={setSelectedArticle}
                onOpenService={(service) => {
                  setServiceReturnTab('favorites');
                  setSelectedService(service);
                }}
                onOpenTool={(id) => {
                  setFavoriteLaunch({ kind: 'tool', id });
                  setActiveTab('ai-tools');
                  setSelectedCategory('all');
                }}
                onOpenCareer={(id) => {
                  setFavoriteLaunch({ kind: 'career', id });
                  setSelectedCategory('jobs');
                  setActiveTab('search');
                }}
                onNavigateCategory={(category) => {
                  setSelectedCategory(category);
                  setActiveTab(category === 'tools' ? 'ai-tools' : 'search');
                }}
              />
            )}

            {/* TAB 4: SMART AI TOOLS VIEW */}
            {activeTab === 'ai-tools' && (
              <AIToolsPage detailId={navigation.state.nestedDetailId} onDetailChange={(id) => navigation.field('nestedDetailId')[1](id)}
                onBack={goBack}
                onNavigateCategory={(category) => {
                  setFavoriteLaunch(null);
                  setSelectedCategory(category);
                  setActiveTab('search');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenService={(serviceId) => {
                  const service = PUBLIC_SERVICES.find((item) => item.id === serviceId);
                  if (!service) return;
                  setServiceReturnTab('ai-tools');
                  setSelectedServiceTrack(service.audience);
                  setSelectedService(service);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                favoriteIds={favoriteIdsFor('tool')}
                onToggleFavorite={(id) => handleToggleFavorite('tool', id)}
                initialSelectedId={favoriteLaunch?.kind === 'tool' ? favoriteLaunch.id : undefined}
              />
            )}

            {/* TAB: STUDENT WORKSPACE / PHASE 15 PUBLIC UI BASELINE */}
            {activeTab === 'account' && (
              <StudentWorkspacePage
                profile={null}
                language={language}
                isDarkMode={isDarkMode}
                favoriteTypeCounts={favoriteTypeCounts}
                favoritesCount={favoriteKeys.length}
                milestones={milestones}
                notifications={notifications}
                onOpenFavorites={() => {
                  setActiveTab('favorites');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenTracker={() => {
                  setActiveTab('tracker');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenNotifications={() => setIsNotificationOpen(true)}
                onOpenGlobalSearch={() => {
                  setGlobalSearchQuery('');
                  setSelectedCategory('all');
                  setIsSmartSearchOpen(false);
                  setActiveTab('search');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenSmartSearch={() => {
                  setGlobalSearchQuery('');
                  setSelectedCategory('all');
                  setActiveTab('search');
                  setIsSmartSearchOpen(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenTools={() => {
                  setActiveTab('ai-tools');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onOpenAuth={() => {
                  setActiveTab('auth');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onToggleLanguage={openLanguage}
                onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
              />
            )}

            {/* TAB: AUTH PAGE */}
            {activeTab === 'auth' && (
              <div className="w-full max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-center min-h-[70vh]">
                <AuthPage onBackToWorkspace={goBack} />
              </div>
            )}

            {/* TAB 5: LEARNER PROGRESS TRACKER VIEW (نظام متابعة تقدم المتعلمين) */}
            {activeTab === 'tracker' && (
              <div className="w-full max-w-4xl lg:max-w-5xl mx-auto">
                <LearnerProgressTracker
                  milestones={milestones}
                  onUpdateMilestone={(updated) => {
                    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
                  }}
                  onAddMilestone={(newM) => {
                    setMilestones((prev) => [newM, ...prev]);
                  }}
                  onDeleteMilestone={(id) => {
                    setMilestones((prev) => prev.filter((m) => m.id !== id));
                  }}
                  allScholarships={scholarships}
                  courses={MOCK_COURSES}
                  onOpenAiLetterForScholarship={(schTitle) => {
                    setPresetAiScholarship(schTitle);
                    setAiToolsInitialTab('letter');
                    setIsAiToolsOpen(true);
                  }}
                  onOpenScholarshipDetails={(sch) => setSelectedScholarship(sch)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Docked Navigation Bar (Always Visible) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => tab === 'notifications' ? setIsNotificationOpen(true) : openSection(tab)}
        favoritesCount={favoriteKeys.length}
        unreadNotificationsCount={unreadNotificationsCount}
        isNotificationsOpen={isNotificationOpen}
      />

      {/* Slide-out Navigation Drawer Menu */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userProfile={null}
        language={language}
        onToggleLanguage={openLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onNavigate={openSection}
        unreadCount={unreadNotificationsCount}
      />

      {/* Push Notification Center & Dropdown Toast */}
      <PushNotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        }}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onTriggerTestPush={() => triggerInstantPush()}
        onSelectAction={(actionType, targetId) => {
          if (actionType === 'scholarship' && targetId) {
            const found = scholarships.find((s) => s.id === targetId);
            if (found) setSelectedScholarship(found);
            else triggerInstantPush({title: 'الفرصة غير متاحة في هذه المعاينة', body: 'يمكنك استكشاف الفرص المتاحة من البحث العام. لم نفتح فرصة مختلفة بدلًا منها.', type: 'system'});
          } else if (actionType === 'ai-tools') {
            openSection('ai-tools');
          } else if (actionType === 'tracker') {
            openSection('tracker');
          }
        }}
        activeToast={activeToast}
        onDismissToast={() => setActiveToast(null)}
      />

      {/* AI Tools Modal */}
      <AIToolsModal
        isOpen={isAiToolsOpen}
        onClose={() => setIsAiToolsOpen(false)}
        initialTab={aiToolsInitialTab}
        allScholarships={scholarships}
        onSelectScholarship={(sch) => {
          setSelectedScholarship(sch);
          setIsAiToolsOpen(false);
        }}
        presetScholarshipTitle={presetAiScholarship}
      />
    </div>
  );
}
