import React, { useState, useEffect } from 'react';
import { useOverlayDialog } from '../useOverlayDialog';
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
  useEffect(() => {if (isOpen) setActiveTab(initialTab);}, [isOpen, initialTab]);

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

  useOverlayDialog(isOpen, onClose, 'mn-ai-dialog');
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
    <div onClick={event => {if (event.target === event.currentTarget) onClose();}} className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[80] flex items-center justify-center p-2 overflow-y-auto">
      <div id="mn-ai-dialog" role="dialog" aria-modal="true" aria-label="أدوات منارتك" tabIndex={-1} className="bg-[var(--mn-surface)] rounded-3xl max-w-[420px] w-full shadow-2xl border border-[var(--mn-border-gold)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 mn-panel ">
        {/* Header with var(--mn-primary) & var(--mn-accent-soft) */}
        <div className="bg-[var(--mn-primary)] p-4 text-white flex items-center justify-between border-b border-[var(--mn-accent)]/30 mn-inverse ">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center text-[var(--mn-accent-text)] mn-inverse ">
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
            aria-label="إغلاق" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--mn-primary)] hover:bg-black/30 text-[var(--mn-text-muted)] hover:text-white flex items-center justify-center transition-colors cursor-pointer mn-inverse "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 bg-[var(--mn-surface-muted)] p-1 border-b border-[var(--mn-border)] text-center mn-panel ">
          <button
            onClick={() => setActiveTab('letter')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'letter'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs mn-inverse '
                : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>خطاب الدافع</span>
          </button>

          <button
            onClick={() => setActiveTab('cv')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'cv'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs mn-inverse '
                : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>تقييم القبول</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs mn-inverse '
                : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث ذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-xs mn-inverse '
                : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
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
              <div className="p-2.5 rounded-xl bg-[var(--mn-gold-surface)] border border-[var(--mn-border-gold)] text-xs text-[var(--mn-accent-text)] font-semibold mn-panel ">
                ✍️ يقوم الذكاء الاصطناعي بصياغة خطاب دافع (Motivation Letter) قوي ومخصص لمعايير لجان
                القبول الدولية.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    اسم الطالب:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    لغة الخطاب:
                  </label>
                  <select
                    value={letterLanguage}
                    onChange={(e) => setLetterLanguage(e.target.value as any)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs font-bold text-[var(--mn-heading)] mn-panel "
                  >
                    <option value="ar">العربية الفصحى</option>
                    <option value="en">English (الإنجليزية)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    المنحة المستهدفة:
                  </label>
                  <input
                    type="text"
                    value={scholarshipName}
                    onChange={(e) => setScholarshipName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    الجامعة / التخصص:
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                  الخلفية الأكاديمية والمهنية المختصرة:
                </label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                  أهدافك المستقبلية وأثر المنحة عليك:
                </label>
                <textarea
                  value={futureGoals}
                  onChange={(e) => setFutureGoals(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                />
              </div>

              <button
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter}
                className="w-full py-2.5 bg-gradient-to-r from-[var(--mn-accent)] via-[var(--mn-accent)] to-[var(--mn-accent)] hover:from-[var(--mn-accent)] hover:to-[var(--mn-accent)] text-[var(--mn-on-accent)] font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mn-gold hover:mn-gold "
              >
                {isGeneratingLetter ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[var(--mn-heading)]" />
                    <span>جارٍ كتابة وصياغة الخطاب الاحترافي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[var(--mn-heading)]" />
                    <span>توليد خطاب الدافع الآن بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>

              {/* Generated Result */}
              {generatedLetter && (
                <div className="mt-4 p-3 bg-[var(--mn-page)] rounded-2xl border border-[var(--mn-border)] space-y-2 mn-panel ">
                  <div className="flex items-center justify-between border-b border-[var(--mn-border)] pb-2">
                    <span className="text-xs font-bold text-[var(--mn-heading)]">
                      الخطاب المقترح للتقديم:
                    </span>
                    <button
                      onClick={handleCopyLetter}
                      className="flex items-center gap-1 text-[11px] font-bold text-[var(--mn-accent-text)] bg-[var(--mn-gold-surface)] hover:bg-[var(--mn-gold-surface)] px-2.5 py-1 rounded-lg transition-colors mn-panel hover:mn-panel "
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  <div className="text-xs text-[var(--mn-heading)] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto p-2 bg-[var(--mn-surface)] rounded-xl border border-[var(--mn-border)] font-sans mn-panel ">
                    {generatedLetter}
                  </div>

                  {letterTips.length > 0 && (
                    <div className="p-2 bg-[var(--mn-surface-muted)]/60 rounded-xl border border-[var(--mn-border-brand)] text-[11px] text-[var(--mn-heading)] space-y-1">
                      <div className="font-bold text-[var(--mn-heading)]">نصائح الخبير:</div>
                      {letterTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-[var(--mn-accent-text)] font-bold">•</span>
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
              <div className="p-2.5 rounded-xl bg-[var(--mn-surface-muted)]/60 border border-[var(--mn-border-brand)] text-xs text-[var(--mn-heading)] font-semibold">
                🎯 اختبر نسبة مطابقة مؤهلاتك مع معايير القبول في كبرى المنح الدولية واعرف نقاط القوة
                والتحسين.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    المعدل التراكمي (GPA):
                  </label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    مستوى اللغة (IELTS/TOEFL):
                  </label>
                  <input
                    type="text"
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    التخصص المستهدف:
                  </label>
                  <input
                    type="text"
                    value={cvMajor}
                    onChange={(e) => setCvMajor(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                    الدولة أو الوجهة:
                  </label>
                  <input
                    type="text"
                    value={cvCountry}
                    onChange={(e) => setCvCountry(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--mn-text)] mb-1">
                  الأنشطة، التطوع، والأبحاث:
                </label>
                <textarea
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs mn-panel "
                />
              </div>

              <button
                onClick={handleEvaluateProfile}
                disabled={isEvaluatingCv}
                className="w-full py-2.5 bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] font-extrabold text-xs rounded-xl shadow-md hover:bg-[var(--mn-primary)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mn-inverse hover:mn-inverse "
              >
                {isEvaluatingCv ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[var(--mn-accent-soft)]" />
                    <span>جارٍ تحليل الملف الأكاديمي...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-[var(--mn-accent-soft)]" />
                    <span>تحليل وتقييم فرص القبول</span>
                  </>
                )}
              </button>

              {/* Evaluation Results */}
              {cvResult && (
                <div className="mt-3 p-3 bg-[var(--mn-surface)] rounded-2xl border-2 border-[var(--mn-border-brand)]/40 shadow-md space-y-3 mn-panel ">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--mn-text-muted)] font-bold">
                        نسبة الجاهزية والقبول:
                      </span>
                      <div className="text-xl font-black text-[var(--mn-heading)]">
                        {cvResult.matchPercentage || 88}%
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[var(--mn-surface-muted)] text-[var(--mn-heading)] font-extrabold text-xs rounded-full mn-panel ">
                      {cvResult.readinessLevel || 'مرتفع'}
                    </span>
                  </div>

                  {cvResult.strengths && (
                    <div>
                      <div className="text-xs font-bold text-[var(--mn-heading)] mb-1">
                        💪 نقاط القوة في ملفك:
                      </div>
                      <div className="space-y-1">
                        {cvResult.strengths.map((s: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-[var(--mn-text)]"
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
                      <div className="text-xs font-bold text-[var(--mn-accent-text)] mb-1">
                        🚀 فرص التحسين المقترحة:
                      </div>
                      <div className="space-y-1">
                        {cvResult.improvements.map((imp: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-[var(--mn-text)]"
                          >
                            <span className="w-2 h-2 rounded-full bg-[var(--mn-accent)] shrink-0 mn-gold " />
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
              <div className="p-2.5 rounded-xl bg-[var(--mn-gold-surface)] border border-[var(--mn-border-gold)] text-xs text-[var(--mn-accent-text)] font-semibold mn-panel ">
                🔍 اكتب ما تبحث عنه بلغتك الطبيعية وسيقوم الذكاء الاصطناعي باستخراج المعايير وتصفية
                المنح تلقائياً.
              </div>

              <div>
                <textarea
                  value={aiSearchPrompt}
                  onChange={(e) => setAiSearchPrompt(e.target.value)}
                  rows={3}
                  placeholder="مثال: أريد منحة ممولة بالكامل لدراسة ماجستير هندسة البرمجيات في أوروبا بدون شرط اختبار آيلتس..."
                  className="w-full py-2 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs text-[var(--mn-heading)] focus:outline-hidden focus:border-[var(--mn-border-brand)] mn-panel "
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAiSearch}
                  disabled={isAiSearching || !aiSearchPrompt.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[var(--mn-accent)] to-[var(--mn-accent)] text-[var(--mn-on-accent)] font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mn-gold "
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
                <div className="p-3 bg-[var(--mn-page)] rounded-2xl border border-[var(--mn-border)] space-y-2 text-xs mn-panel ">
                  <div className="font-bold text-[var(--mn-heading)] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                    <span>تحليل الاستفسار:</span>
                  </div>
                  <p className="text-[var(--mn-text)] text-[11px] leading-relaxed">
                    {aiSearchResult.aiAdvice || aiSearchResult.summary}
                  </p>

                  <div className="pt-2">
                    <div className="font-bold text-[var(--mn-heading)] mb-1">المنح الموصى بها لك:</div>
                    <div className="space-y-1.5">
                      {allScholarships.slice(0, 3).map((sch) => (
                        <div
                          key={sch.id}
                          onClick={() => {
                            onSelectScholarship(sch);
                            onClose();
                          }}
                          className="p-2 rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] hover:border-[var(--mn-border-gold)] flex items-center justify-between cursor-pointer mn-panel "
                        >
                          <div className="flex items-center gap-2">
                            <span>{sch.countryFlag}</span>
                            <span className="font-bold text-[var(--mn-heading)]">{sch.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--mn-accent-text)]">
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
              <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-[var(--mn-page)] rounded-2xl border border-[var(--mn-border)] mn-panel ">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[var(--mn-primary)] text-white rounded-br-none mn-inverse '
                          : 'bg-[var(--mn-surface)] border border-[var(--mn-border-gold)] text-[var(--mn-heading)] rounded-bl-none shadow-2xs mn-panel '
                      }`}
                    >
                      <div className="font-bold text-[10px] text-[var(--mn-accent-soft)] mb-1">
                        {msg.role === 'user' ? 'أنت' : 'مستشار منارتك الذكي 🤖'}
                      </div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="flex justify-end">
                    <div className="bg-[var(--mn-surface)] border border-[var(--mn-border)] p-2 rounded-2xl text-[11px] text-[var(--mn-text-muted)] flex items-center gap-1.5 mn-panel ">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--mn-accent-text)]" />
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
                  className="flex-1 py-2 px-3 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-xl text-xs focus:outline-hidden focus:border-[var(--mn-border-brand)] mn-panel "
                />
                <button
                  onClick={handleSendChat}
                  disabled={isSendingChat || !chatInput.trim()}
                  className="p-2.5 bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] rounded-xl hover:bg-[var(--mn-primary)] active:scale-95 transition-all disabled:opacity-50 mn-inverse hover:mn-inverse "
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
