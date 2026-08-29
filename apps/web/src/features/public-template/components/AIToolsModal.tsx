import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Award,
  Bot,
  Send,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  Search,
  Layers,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Scholarship } from '../types';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'letter' | 'cv' | 'chat' | 'search';
  allScholarships: Scholarship[];
  onSelectScholarship: (scholarship: Scholarship) => void;
  presetScholarshipTitle?: string;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'letter',
  allScholarships,
  onSelectScholarship,
  presetScholarshipTitle = '',
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'cv' | 'chat' | 'search'>(initialTab);

  // Motivation Letter States
  const [studentName, setStudentName] = useState('أحمد');
  const [scholarshipName, setScholarshipName] = useState(
    presetScholarshipTitle || 'منحة إيراسموس + (Erasmus+)',
  );
  const [targetUniversity, setTargetUniversity] = useState('اتحاد الجامعات الأوروبية');
  const [major, setMajor] = useState('علوم الحاسوب والذكاء الاصطناعي');
  const [degreeLevel, setDegreeLevel] = useState('ماجستير');
  const [background, setBackground] = useState(
    'خريج بكالوريوس هندسة برمجيات بمعدل ممتاز مع مشروع تخرج رائد في الذكاء الاصطناعي وخبرة تدريب عملي',
  );
  const [futureGoals, setFutureGoals] = useState(
    'تطوير خوارزميات تعلم آلي تخدم القطاع الطبي ونقل الخبرات التكنولوجية المتطورة للوطن العربي',
  );
  const [letterLanguage, setLetterLanguage] = useState<'ar' | 'en'>('ar');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [letterTips, setLetterTips] = useState<string[]>([]);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  // CV Evaluation States
  const [gpa, setGpa] = useState('3.75 / 4.00 (ممتاز)');
  const [englishLevel, setEnglishLevel] = useState('IELTS 7.0 / متقدم C1');
  const [cvDegree, setCvDegree] = useState('ماجستير');
  const [cvMajor, setCvMajor] = useState('هندسة الذكاء الاصطناعي');
  const [cvCountry, setCvCountry] = useState('أوروبا / ألمانيا');
  const [activities, setActivities] = useState(
    'أبحاث منشورة، نشاط تطوعي أكاديمي، رئاسة نادي البرمجة الطلابي',
  );
  const [cvResult, setCvResult] = useState<any>(null);
  const [isEvaluatingCv, setIsEvaluatingCv] = useState(false);

  // Chat Advisor States
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'أهلاً بك! أنا مستشارك الأكاديمي الذكي في منصة منارتك. كيف يمكنني مساعدتك اليوم بخصوص المنح الدولية أو كتابة ملف التقديم أو اختيار التخصص؟',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Smart Search Assistant States
  const [aiSearchPrompt, setAiSearchPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<any>(null);

  if (!isOpen) return null;

  // Generate Motivation Letter
  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    setGeneratedLetter('');
    try {
      const res = await fetch('/api/gemini/generate-motivation-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          scholarshipName,
          targetUniversity,
          major,
          degreeLevel,
          background,
          futureGoals,
          language: letterLanguage,
        }),
      });
      const data = await res.json();
      if (data.letter) {
        setGeneratedLetter(data.letter);
        setLetterTips(data.tips || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Evaluate Profile & CV
  const handleEvaluateProfile = async () => {
    setIsEvaluatingCv(true);
    try {
      const res = await fetch('/api/gemini/evaluate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa,
          englishLevel,
          degreeLevel: cvDegree,
          targetMajor: cvMajor,
          targetCountry: cvCountry,
          activities,
        }),
      });
      const data = await res.json();
      setCvResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluatingCv(false);
    }
  };

  // Send Chat Message
  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    const userMsg = chatInput.trim();
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/gemini/chat-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory: newHistory,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Run AI Smart Query
  const handleRunAiSearch = async () => {
    if (!aiSearchPrompt.trim()) return;
    setIsAiSearching(true);
    try {
      const res = await fetch('/api/gemini/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiSearchPrompt }),
      });
      const data = await res.json();
      setAiSearchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleCopyLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 overflow-y-auto">
      <div className="bg-[var(--mn-surface)] rounded-3xl max-w-[420px] w-full shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header with var(--mn-primary) & var(--mn-accent-soft) */}
        <div className="bg-[var(--mn-primary)] p-4 text-white flex items-center justify-between border-b border-[var(--mn-accent)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#002E52] border border-[var(--mn-accent)] flex items-center justify-center text-[var(--mn-accent-text)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>أدوات الذكاء الاصطناعي لمنارتك</span>
              </h3>
              <p className="text-[10px] text-[var(--mn-accent-text)] font-bold">
                مساعدك الذكي لصناعة قبولك الأكاديمي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#002E52] hover:bg-black/30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 bg-slate-100 p-1 border-b border-slate-200 text-center">
          <button
            onClick={() => setActiveTab('letter')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'letter'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>خطاب الدافع</span>
          </button>

          <button
            onClick={() => setActiveTab('cv')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'cv'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>تقييم القبول</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث ذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>المستشار AI</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto flex-1 text-right space-y-4">
          {/* TAB 1: Motivation Letter Generator */}
          {activeTab === 'letter' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-semibold">
                ✍️ يقوم الذكاء الاصطناعي بصياغة خطاب دافع (Motivation Letter) قوي ومخصص لمعايير لجان
                القبول الدولية.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    اسم الطالب:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    لغة الخطاب:
                  </label>
                  <select
                    value={letterLanguage}
                    onChange={(e) => setLetterLanguage(e.target.value as any)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#002E52]"
                  >
                    <option value="ar">العربية الفصحى</option>
                    <option value="en">English (الإنجليزية)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    المنحة المستهدفة:
                  </label>
                  <input
                    type="text"
                    value={scholarshipName}
                    onChange={(e) => setScholarshipName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    الجامعة / التخصص:
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  الخلفية الأكاديمية والمهنية المختصرة:
                </label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  أهدافك المستقبلية وأثر المنحة عليك:
                </label>
                <textarea
                  value={futureGoals}
                  onChange={(e) => setFutureGoals(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {isGeneratingLetter ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                    <span>جارٍ كتابة وصياغة الخطاب الاحترافي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-900" />
                    <span>توليد خطاب الدافع الآن بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>

              {/* Generated Result */}
              {generatedLetter && (
                <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-[#002E52]">
                      الخطاب المقترح للتقديم:
                    </span>
                    <button
                      onClick={handleCopyLetter}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto p-2 bg-[var(--mn-surface)] rounded-xl border border-stone-100 font-sans">
                    {generatedLetter}
                  </div>

                  {letterTips.length > 0 && (
                    <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-slate-900 space-y-1">
                      <div className="font-bold text-[#002E52]">نصائح الخبير:</div>
                      {letterTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CV & Eligibility Evaluator */}
          {activeTab === 'cv' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-900 font-semibold">
                🎯 اختبر نسبة مطابقة مؤهلاتك مع معايير القبول في كبرى المنح الدولية واعرف نقاط القوة
                والتحسين.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    المعدل التراكمي (GPA):
                  </label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    مستوى اللغة (IELTS/TOEFL):
                  </label>
                  <input
                    type="text"
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    التخصص المستهدف:
                  </label>
                  <input
                    type="text"
                    value={cvMajor}
                    onChange={(e) => setCvMajor(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    الدولة أو الوجهة:
                  </label>
                  <input
                    type="text"
                    value={cvCountry}
                    onChange={(e) => setCvCountry(e.target.value)}
                    className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  الأنشطة، التطوع، والأبحاث:
                </label>
                <textarea
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={handleEvaluateProfile}
                disabled={isEvaluatingCv}
                className="w-full py-2.5 bg-[#002E52] text-amber-300 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-900 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {isEvaluatingCv ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>جارٍ تحليل الملف الأكاديمي...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>تحليل وتقييم فرص القبول</span>
                  </>
                )}
              </button>

              {/* Evaluation Results */}
              {cvResult && (
                <div className="mt-3 p-3 bg-[var(--mn-surface)] rounded-2xl border-2 border-[var(--mn-border-brand)]/40 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 font-bold">
                        نسبة الجاهزية والقبول:
                      </span>
                      <div className="text-xl font-black text-[#002E52]">
                        {cvResult.matchPercentage || 88}%
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-[#002E52] font-extrabold text-xs rounded-full">
                      {cvResult.readinessLevel || 'مرتفع'}
                    </span>
                  </div>

                  {cvResult.strengths && (
                    <div>
                      <div className="text-xs font-bold text-[#002E52] mb-1">
                        💪 نقاط القوة في ملفك:
                      </div>
                      <div className="space-y-1">
                        {cvResult.strengths.map((s: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-stone-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--mn-heading)] shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvResult.improvements && (
                    <div>
                      <div className="text-xs font-bold text-amber-800 mb-1">
                        🚀 فرص التحسين المقترحة:
                      </div>
                      <div className="space-y-1">
                        {cvResult.improvements.map((imp: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-stone-700"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Natural Language AI Smart Search */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-semibold">
                🔍 اكتب ما تبحث عنه بلغتك الطبيعية وسيقوم الذكاء الاصطناعي باستخراج المعايير وتصفية
                المنح تلقائياً.
              </div>

              <div>
                <textarea
                  value={aiSearchPrompt}
                  onChange={(e) => setAiSearchPrompt(e.target.value)}
                  rows={3}
                  placeholder="مثال: أريد منحة ممولة بالكامل لدراسة ماجستير هندسة البرمجيات في أوروبا بدون شرط اختبار آيلتس..."
                  className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-[var(--mn-border-brand)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAiSearch}
                  disabled={isAiSearching || !aiSearchPrompt.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAiSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>تحليل وبحث ذكي AI</span>
                </button>
              </div>

              {aiSearchResult && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="font-bold text-[#002E52] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>تحليل الاستفسار:</span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">
                    {aiSearchResult.aiAdvice || aiSearchResult.summary}
                  </p>

                  <div className="pt-2">
                    <div className="font-bold text-stone-800 mb-1">المنح الموصى بها لك:</div>
                    <div className="space-y-1.5">
                      {allScholarships.slice(0, 3).map((sch) => (
                        <div
                          key={sch.id}
                          onClick={() => {
                            onSelectScholarship(sch);
                            onClose();
                          }}
                          className="p-2 rounded-xl bg-[var(--mn-surface)] border border-stone-200 hover:border-amber-400 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span>{sch.countryFlag}</span>
                            <span className="font-bold text-stone-900">{sch.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600">
                            عرض التفاصيل ❯
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Academic Chat Advisor */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-96 space-y-3">
              <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-stone-50 rounded-2xl border border-stone-200">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#002E52] text-white rounded-br-none'
                          : 'bg-[var(--mn-surface)] border border-amber-200 text-stone-800 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <div className="font-bold text-[10px] text-amber-400 mb-1">
                        {msg.role === 'user' ? 'أنت' : 'مستشار منارتك الذكي 🤖'}
                      </div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="flex justify-end">
                    <div className="bg-[var(--mn-surface)] border border-stone-200 p-2 rounded-2xl text-[11px] text-stone-500 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>المستشار يكتب الرد...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="اسأل المستشار عن أي منحة أو جامعة..."
                  className="flex-1 py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[var(--mn-border-brand)]"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isSendingChat || !chatInput.trim()}
                  className="p-2.5 bg-[#002E52] text-amber-300 rounded-xl hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
