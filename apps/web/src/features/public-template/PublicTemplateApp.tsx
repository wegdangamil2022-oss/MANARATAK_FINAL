import React, { useState, useEffect } from 'react';
import './template.css';
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
} from './data/mockData';
import { Header } from './components/Header';
import { SmartSearchBar } from './components/SmartSearchBar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { FeaturedScholarships } from './components/FeaturedScholarships';
import { ScholarshipsSearchPage } from './components/ScholarshipsSearchPage';
import { CountriesSearchPage } from './components/CountriesSearchPage';
import { AIToolsPage } from './components/AIToolsPage';
import { ExamsSearchPage } from './components/ExamsSearchPage';
import { CoursesSearchPage } from './components/CoursesSearchPage';
import { AIToolsBanner } from './components/AIToolsBanner';
import { FeaturedUniversities } from './components/FeaturedUniversities';
import { FeaturedCountries } from './components/FeaturedCountries';
import { FeaturedMajors } from './components/FeaturedMajors';
import { FeaturedCourses } from './components/FeaturedCourses';
import { FeaturedExams } from './components/FeaturedExams';
import { FeaturedJobs } from './components/FeaturedJobs';
import { FeaturedArticles } from './components/FeaturedArticles';
import { FeaturedServices } from './components/FeaturedServices';
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
import { UniversitiesList } from './components/UniversitiesList';
import { CoursesList } from './components/CoursesList';
import { MajorsSearchPage } from './components/MajorsSearchPage';
import { UniversitiesSearchPage } from './components/UniversitiesSearchPage';
import { NavigationDrawer } from './components/NavigationDrawer';
import { AuthPage } from './components/AuthPage';
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
  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [language, setLanguage] = useState<Language>('ar');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('manaratak_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('الكل');
  const [selectedDegree, setSelectedDegree] = useState<string>('الكل');
  const [onlyFullyFunded, setOnlyFullyFunded] = useState<boolean>(false);
  const [onlyWithoutIelts, setOnlyWithoutIelts] = useState<boolean>(false);

  // Data States with LocalStorage Persistence
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    const saved = localStorage.getItem('manaratak_scholarships');
    return saved ? JSON.parse(saved) : INITIAL_SCHOLARSHIPS;
  });

  const [milestones, setMilestones] = useState<ApplicationMilestone[]>(() => {
    const saved = localStorage.getItem('manaratak_milestones');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('manaratak_favorites');
    return saved ? JSON.parse(saved) : ['erasmus-plus', 'chevening-uk'];
  });

  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() => {
    const saved = localStorage.getItem('manaratak_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modal Dialogs
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAiToolsOpen, setIsAiToolsOpen] = useState<boolean>(false);
  const [aiToolsInitialTab, setAiToolsInitialTab] = useState<'letter' | 'cv' | 'chat' | 'search'>(
    'letter',
  );
  const [presetAiScholarship, setPresetAiScholarship] = useState<string>('');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);

  // Sync Dark Mode Class to HTML and Body
  useEffect(() => {
    localStorage.setItem('manaratak_dark_mode', String(isDarkMode));
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
    localStorage.setItem('manaratak_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('manaratak_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('manaratak_notifications', JSON.stringify(notifications));
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
      id: `push-${Date.now()}`,
      title: customNotification?.title || '⚡ تنبيه فوري: منحة جديدة متاحة الآن!',
      body:
        customNotification?.body ||
        'تم الإعلان عن منحة ماجستير ودكتوراه ممولة بالكامل في جامعة السوربون بباريس.',
      timestamp: 'الآن',
      type: customNotification?.type || 'urgent',
      read: false,
      actionType: customNotification?.actionType || 'scholarship',
      targetId: customNotification?.targetId || 'erasmus-plus',
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
    const timer = setTimeout(() => {
      triggerInstantPush({
        title: '🔔 مرحباً بك في منصة منارتك للفرص التعليمية!',
        body: 'تم تفعيل التنبيهات الفورية لمتابعة مواعيد إغلاق المنح والفرص التعليمية الجديدة.',
        type: 'system',
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Deadline 3-day Local Notification Check (نظام متابعة تقدم المتعلمين)
  useEffect(() => {
    if (!milestones.length) return;

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
          setTimeout(
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
          ); // Stagger if multiple, run after initial welcome push
        }
      }
    });
  }, [milestones, notifications]);

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-[#031322] text-slate-900 dark:text-slate-100 selection:bg-[#E4B343]/30 selection:text-slate-950 font-['Cairo',sans-serif] pb-24 sm:pb-28 transition-colors">
      {/* App Header (Top Sticky) */}
      <Header
        language={language}
        onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenProfile={() => {
          setSelectedScholarship(null);
          setSelectedUniversity(null);
          setActiveTab('auth');
        }}
        unreadCount={unreadNotificationsCount}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedScholarship(null);
          setSelectedUniversity(null);
          setActiveTab(tab);
          if (tab === 'home') setSelectedCategory('all');
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedScholarship(null);
          setSelectedUniversity(null);
          setSelectedCategory(cat);
          if (cat !== 'all') setActiveTab('search');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="w-full mx-auto transition-all flex-1 flex flex-col">
        {selectedScholarship ? (
          <ScholarshipDetailModal
            scholarship={selectedScholarship}
            onClose={() => setSelectedScholarship(null)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoriteIds.includes(selectedScholarship.id)}
            onAddToTracker={handleAddToTracker}
            onOpenAiLetter={(title) => {
              setPresetAiScholarship(title);
              setAiToolsInitialTab('letter');
              setIsAiToolsOpen(true);
            }}
          />
        ) : selectedUniversity ? (
          <UniversityDetailModal
            university={selectedUniversity}
            onClose={() => setSelectedUniversity(null)}
            isSaved={favoriteIds.includes(selectedUniversity.id)}
            onToggleSave={(e) => {
              e.stopPropagation();
              handleToggleFavorite(selectedUniversity.id);
            }}
          />
        ) : selectedMajor ? (
          <MajorDetailModal major={selectedMajor} onClose={() => setSelectedMajor(null)} />
        ) : (
          <>
            {/* TAB 1: HOME VIEW (Exactly as in Reference Screenshot) */}
            {activeTab === 'home' && selectedCategory === 'all' && (
              <div className="flex flex-col items-center w-full px-3 sm:px-4 pt-2 sm:pt-3">
                <div className="w-full space-y-1">
                  {/* 1. Smart Search Input */}
                  <SmartSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={(q) => {
                      setSearchQuery(q);
                      if (q) setActiveTab('search');
                    }}
                    onSelectTag={(tag) => {
                      setSearchQuery(tag);
                      setActiveTab('search');
                    }}
                    selectedCountry={selectedCountry}
                    onSelectCountry={(c) => {
                      setSelectedCountry(c);
                      setActiveTab('search');
                    }}
                    onOpenAiTools={(tab) => {
                      setAiToolsInitialTab(tab || 'search');
                      setIsAiToolsOpen(true);
                    }}
                  />

                  {/* 2. Hero Banner matching Mockup */}
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
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      if (cat !== 'all') {
                        if (cat === 'scholarships') setActiveTab('search');
                        else if (cat === 'universities') setActiveTab('search');
                        else if (cat === 'courses') setActiveTab('search');
                        else if (cat === 'majors') setActiveTab('search');
                        else if (cat === 'countries') setActiveTab('search');
                      }
                    }}
                  />
                </div>

                {/* --- Timeline Container for All Sections --- */}
                <div className="w-full relative mt-2 pb-4">
                  {/* 🌟 The Glowing Scroll Track (Yellow line only) pushed to exact right edge */}
                  <div className="absolute right-0 sm:-right-2 top-8 bottom-12 w-[3px] z-0">
                    <div className="sticky top-1/2 w-full h-24 -mt-12 bg-gradient-to-b from-transparent via-[#D9A93A]/80 to-transparent rounded-full animate-pulse-subtle shadow-[0_0_8px_rgba(200,162,74,0.6)]"></div>
                  </div>

                  <div className="space-y-5 relative z-10 w-full px-1 sm:px-2">
                    {/* 1. Featured Scholarships */}
                    <div className="relative w-full">
                      <FeaturedScholarships
                        scholarships={scholarships}
                        onSelectScholarship={(s) => setSelectedScholarship(s)}
                        onToggleFavorite={handleToggleFavorite}
                        favoriteIds={favoriteIds}
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
                        onSelectCountry={(countryName) => {
                          setSelectedCountry(countryName);
                          setActiveTab('search');
                          setSelectedCategory('scholarships');
                        }}
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
                      <RoadmapPreview />
                    </div>

                    {/* 7. Featured Exams */}
                    <div className="relative w-full">
                      <FeaturedExams
                        exams={MOCK_EXAMS}
                        onSelectExam={(exam) => {
                          setSearchQuery(exam.name);
                          setActiveTab('search');
                          setSelectedCategory('exams');
                        }}
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
                        onSelectCourse={(course) => {
                          setSearchQuery(course.title);
                          setActiveTab('search');
                          setSelectedCategory('courses');
                        }}
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
                          setActiveTab('search');
                          setSelectedCategory('all');
                          setSearchQuery('وظائف');
                        }}
                      />
                    </div>

                    {/* 10. Featured Articles (Magazine Style) */}
                    <div className="relative w-full">
                      <FeaturedArticles
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('all');
                          setSearchQuery('مقالات');
                        }}
                      />
                    </div>

                    {/* 11. Featured Services (Students & Corporate) */}
                    <div className="relative w-full pb-2">
                      <FeaturedServices
                        onViewAllClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('all');
                          setSearchQuery('خدمات');
                        }}
                      />
                    </div>

                    {/* 12. FAQ Preview */}
                    <div className="relative w-full pb-2">
                      <FaqPreview />
                    </div>

                    {/* 13. Contact & Branches Section */}
                    <div className="relative w-full pb-4">
                      <ContactSection />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SEARCH / DIRECTORY VIEW */}
            {(activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
            (selectedCategory === 'scholarships' || selectedCategory === 'all') ? (
              <ScholarshipsSearchPage
                scholarships={scholarships}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectScholarship={setSelectedScholarship}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'majors' ? (
              <MajorsSearchPage
                majors={MOCK_MAJORS}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectMajor={setSelectedMajor}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'countries' ? (
              <CountriesSearchPage
                countries={MOCK_COUNTRIES}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectCountryScholarships={(countryName) => {
                  setSelectedCountry(countryName);
                  setSelectedCategory('scholarships');
                  setActiveTab('search');
                }}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'universities' ? (
              <UniversitiesSearchPage
                universities={MOCK_UNIVERSITIES}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectUniversity={(uni) => {
                  setSelectedUniversity(uni);
                }}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'exams' ? (
              <ExamsSearchPage
                exams={MOCK_EXAMS}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectExam={(exam) => {
                  setSearchQuery(exam.name);
                  setSelectedCategory('all');
                }}
              />
            ) : (activeTab === 'search' || (activeTab === 'home' && selectedCategory !== 'all')) &&
              selectedCategory === 'courses' ? (
              <CoursesSearchPage
                courses={MOCK_COURSES}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                onSelectCourse={(course) => {
                  setSearchQuery(course.title);
                  setSelectedCategory('all');
                }}
              />
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
                        onClick={() => setSelectedCategory(item.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedCategory === item.id ||
                          (selectedCategory === 'all' && item.id === 'scholarships')
                            ? 'bg-[#002E52] text-amber-300 shadow-xs'
                            : 'bg-[#FAFAFA] border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Specific Category View Dispatcher */}
                  {selectedCategory === 'universities' ? (
                    <UniversitiesList universities={MOCK_UNIVERSITIES} />
                  ) : selectedCategory === 'courses' ? (
                    <CoursesList courses={MOCK_COURSES} />
                  ) : selectedCategory === 'articles' ? (
                    <div className="pt-2">
                      <FeaturedArticles onViewAllClick={() => setSelectedCategory('articles')} />
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
                      <div className="flex items-center justify-between text-xs text-stone-600 font-bold px-1">
                        <span>{filteredScholarships.length} فرصة دراسية متاحة</span>
                        <button
                          onClick={() => {
                            setOnlyFullyFunded(!onlyFullyFunded);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            onlyFullyFunded
                              ? 'bg-amber-400 text-slate-900 border-amber-500'
                              : 'bg-[#FAFAFA] text-stone-700 border-stone-200'
                          }`}
                        >
                          ⭐ ممولة بالكامل فقط
                        </button>
                      </div>

                      {filteredScholarships.length === 0 ? (
                        <div className="py-16 text-center text-stone-500 text-xs space-y-2">
                          <GraduationCap className="w-10 h-10 mx-auto text-stone-300" />
                          <p className="font-bold">لم نجد منحاً تطابق معايير البحث الحالية.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCountry('الكل');
                              setOnlyFullyFunded(false);
                              setOnlyWithoutIelts(false);
                            }}
                            className="px-4 py-1.5 bg-[#002E52] text-amber-300 rounded-xl text-xs font-bold"
                          >
                            إعادة ضبط الفلاتر
                          </button>
                        </div>
                      ) : (
                        filteredScholarships.map((sch) => {
                          const isFavorited = favoriteIds.includes(sch.id);

                          return (
                            <div
                              key={sch.id}
                              onClick={() => setSelectedScholarship(sch)}
                              className="bg-[#FAFAFA] rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden p-3.5 space-y-2.5 text-right hover:border-amber-400 cursor-pointer active:scale-99"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <img
                                    src={sch.imageUrl}
                                    alt={sch.title}
                                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-slate-900 font-black text-[9px]">
                                        {sch.fundingType}
                                      </span>
                                      <span className="text-xs">
                                        {sch.countryFlag} {sch.country}
                                      </span>
                                    </div>
                                    <h3 className="text-xs font-black text-stone-900 mt-1 leading-snug">
                                      {sch.title}
                                    </h3>
                                    <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                                      {sch.university}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(sch.id);
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg"
                                >
                                  <Heart
                                    className={`w-4 h-4 ${
                                      isFavorited
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-400'
                                    }`}
                                  />
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                                <div className="flex items-center gap-2 text-stone-500 font-semibold">
                                  <span className="flex items-center gap-1 text-red-600 font-bold">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {sch.daysLeft} يوم متبقي
                                  </span>
                                  <span>•</span>
                                  <span>{sch.degreeLevel.join(', ')}</span>
                                </div>

                                <span className="text-[11px] font-extrabold text-[#002E52] flex items-center gap-1">
                                  <span>التفاصيل والشروط</span>
                                  <ChevronLeft className="w-3 h-3 text-amber-600" />
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
              <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>المنح المفضلة والمحفوظة</span>
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      قائمتك المختارة للرجوع إليها والتقديم لاحقاً
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-slate-900 text-xs font-black">
                    {favoriteIds.length} محفوظة
                  </span>
                </div>

                {favoriteIds.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 text-xs space-y-2">
                    <Heart className="w-10 h-10 mx-auto text-stone-300" />
                    <p className="font-bold text-stone-600">لا توجد منح في المفضلة بعد.</p>
                    <p className="text-[11px] text-stone-500">
                      اضغط على علامة القلب في أي منحة لإضافتها هنا.
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 bg-[#002E52] text-amber-300 rounded-xl text-xs font-bold mt-2"
                    >
                      تصفح المنح الآن
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scholarships
                      .filter((s) => favoriteIds.includes(s.id))
                      .map((sch) => (
                        <div
                          key={sch.id}
                          onClick={() => setSelectedScholarship(sch)}
                          className="bg-[#FAFAFA] rounded-2xl border border-amber-200 shadow-xs hover:shadow-md p-3.5 space-y-2 text-right cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={sch.imageUrl}
                                alt={sch.title}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                              />
                              <div>
                                <span className="text-[10px] font-bold text-[#002E52]">
                                  {sch.countryFlag} {sch.country}
                                </span>
                                <h3 className="text-xs font-black text-stone-900 leading-snug">
                                  {sch.title}
                                </h3>
                                <p className="text-[10px] text-stone-500">{sch.university}</p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(sch.id);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Heart className="w-4 h-4 fill-red-500" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                            <span className="text-red-600 font-bold text-[10px]">
                              الموعد: {sch.deadline}
                            </span>
                            <span className="text-[#002E52] font-bold text-xs">عرض التفاصيل ❯</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SMART AI TOOLS VIEW */}
            {activeTab === 'ai-tools' && (
              <AIToolsPage
                onBack={() => {
                  setActiveTab('home');
                }}
                onOpenTool={(tab) => {
                  setAiToolsInitialTab(tab || 'letter');
                  setIsAiToolsOpen(true);
                }}
              />
            )}

            {/* TAB: AUTH PAGE */}
            {activeTab === 'auth' && (
              <div className="w-full max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-center min-h-[70vh]">
                <AuthPage />
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
        onTabChange={(tab) => {
          setSelectedScholarship(null);
          setSelectedUniversity(null);
          setActiveTab(tab);
          if (tab === 'home') setSelectedCategory('all');
        }}
        favoritesCount={favoriteIds.length}
        activeTrackerCount={milestones.length}
      />

      {/* Slide-out Navigation Drawer Menu */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userProfile={null}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onNavigate={(target) => {
          setSelectedScholarship(null);
          setSelectedUniversity(null);
          if (target === 'auth') setActiveTab('auth');
          else if (target === 'tracker') setActiveTab('tracker');
          else if (target === 'ai-tools') {
            setActiveTab('ai-tools');
            setIsAiToolsOpen(true);
          } else if (target === 'favorites') setActiveTab('favorites');
          else if (target === 'countries') {
            setActiveTab('search');
            setSelectedCategory('countries');
          } else if (target === 'universities') {
            setActiveTab('search');
            setSelectedCategory('universities');
          } else if (target === 'courses') {
            setActiveTab('search');
            setSelectedCategory('courses');
          } else if (target === 'majors') {
            setActiveTab('search');
            setSelectedCategory('majors');
          } else {
            setActiveTab('home');
            setSelectedCategory('all');
          }
        }}
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
          } else if (actionType === 'ai-tools') {
            setIsAiToolsOpen(true);
          } else if (actionType === 'tracker') {
            setActiveTab('tracker');
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
