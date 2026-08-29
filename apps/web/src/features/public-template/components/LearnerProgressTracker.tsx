import React, { useState } from 'react';
import { ApplicationMilestone, Scholarship, Course } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Calendar,
  Sparkles,
  BookOpen,
  FileText,
  Trash2,
  Trophy,
  BellRing,
} from 'lucide-react';

interface LearnerProgressTrackerProps {
  milestones: ApplicationMilestone[];
  onUpdateMilestone: (updated: ApplicationMilestone) => void;
  onAddMilestone: (newMilestone: ApplicationMilestone) => void;
  onDeleteMilestone: (id: string) => void;
  allScholarships: Scholarship[];
  courses: Course[];
  onOpenAiLetterForScholarship?: (scholarshipTitle: string) => void;
  onOpenScholarshipDetails?: (scholarship: Scholarship) => void;
}

export const LearnerProgressTracker: React.FC<LearnerProgressTrackerProps> = ({
  milestones,
  onUpdateMilestone,
  onAddMilestone,
  onDeleteMilestone,
  allScholarships,
  courses,
  onOpenAiLetterForScholarship,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(milestones[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScholarshipId, setNewScholarshipId] = useState(allScholarships[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');

  const activeMilestone = milestones.find((m) => m.id === selectedMilestoneId) || milestones[0];

  // Calculate overall stats
  const totalChecklistItems = milestones.reduce((acc, m) => acc + m.checklist.length, 0);
  const completedChecklistItems = milestones.reduce(
    (acc, m) => acc + m.checklist.filter((c) => c.completed).length,
    0,
  );
  const overallPercentage =
    totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  const handleToggleTask = (milestoneId: string, taskId: string) => {
    const target = milestones.find((m) => m.id === milestoneId);
    if (!target) return;

    const updatedChecklist = target.checklist.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );

    const completedCount = updatedChecklist.filter((t) => t.completed).length;
    const newProgress = Math.round((completedCount / updatedChecklist.length) * 100);

    let newStage = target.stage;
    if (newProgress === 100) newStage = 'تم إرسال الطلب';
    else if (newProgress >= 70) newStage = 'خطابات التوصية';
    else if (newProgress >= 40) newStage = 'كتابة خطاب الدافع';
    else newStage = 'تجهيز المستندات';

    onUpdateMilestone({
      ...target,
      checklist: updatedChecklist,
      progress: newProgress,
      stage: newStage,
    });
  };

  const handleAddNewTracker = () => {
    const sch = allScholarships.find((s) => s.id === newScholarshipId);
    if (!sch) return;

    const newEntry: ApplicationMilestone = {
      id: `track-${Date.now()}`,
      scholarshipId: sch.id,
      scholarshipTitle: sch.title,
      country: sch.country,
      deadline: sch.deadline,
      stage: 'تجهيز المستندات',
      progress: 0,
      notes: newNotes || 'متابعة خطة التقديم الرسمية لمنحة ' + sch.title,
      checklist: [
        { id: `c-${Date.now()}-1`, task: 'ترجمة وتصديق كشف العلامات الجامعي', completed: false },
        { id: `c-${Date.now()}-2`, task: 'إعداد السيرة الذاتية الأكاديمية', completed: false },
        {
          id: `c-${Date.now()}-3`,
          task: 'صياغة خطاب الدافع (Motivation Letter)',
          completed: false,
        },
        { id: `c-${Date.now()}-4`, task: 'الحصول على خطابات التوصية الأكاديمية', completed: false },
        { id: `c-${Date.now()}-5`, task: 'تقديم الطلب الإلكتروني الرسمي', completed: false },
      ],
    };

    onAddMilestone(newEntry);
    setSelectedMilestoneId(newEntry.id);
    setShowAddModal(false);
    setNewNotes('');
  };

  return (
    <div id="learner-progress-tracker" className="w-full px-5 py-3 space-y-4 pb-24 text-right">
      {/* Professional Polish Progress Card */}
      <div className="bg-[var(--mn-surface)] p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[var(--mn-heading)] text-sm font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[var(--mn-accent-text)]" />
            تقدمك التعليمي العام
          </span>
          <span className="text-[var(--mn-accent-text)] font-black text-sm">
            {overallPercentage}%
          </span>
        </div>

        {/* Progress bar using var(--mn-accent-soft) and slate-100 */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[var(--mn-accent)] h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 font-medium">
          {completedChecklistItems} من {totalChecklistItems} مهام أكاديمية مكتملة بنجاح
        </p>
      </div>

      {/* Push Notification / Instant Updates Alert Box */}
      <div className="bg-[var(--mn-accent)]/10 p-4 rounded-2xl border border-[var(--mn-accent)]/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--mn-accent)]/20 flex items-center justify-center text-[var(--mn-heading)] shrink-0">
            <BellRing className="w-4 h-4 text-[var(--mn-heading)]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">نظام التنبيهات الفورية مفعّل</div>
            <div className="text-[11px] text-slate-600">
              تصلك إشعارات فورية بكل منحة جديدة أو اقتراب موعد نهائي
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[var(--mn-primary)] text-[var(--mn-accent-text)] font-bold text-[10px] shrink-0 shadow-2xs">
          مباشر
        </span>
      </div>

      {/* Tracked Scholarships Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1">
          <span>ملفات التقديم المتابعة</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--mn-primary)]/10 text-[var(--mn-heading)] text-[10px] font-bold">
            {milestones.length}
          </span>
        </h3>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--mn-primary)] hover:bg-[var(--mn-primary-hover)] text-[var(--mn-accent-text)] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة منحة</span>
        </button>
      </div>

      {/* Horizontal Tabs for Tracked Scholarships */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {milestones.map((m) => {
          const isSelected = m.id === selectedMilestoneId;

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMilestoneId(m.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] border-[var(--mn-border-brand)] shadow-xs'
                  : 'bg-[var(--mn-surface)] text-slate-700 border-slate-200 hover:border-[var(--mn-accent)]'
              }`}
            >
              <span>{m.country}</span>
              <span>{m.scholarshipTitle}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  isSelected
                    ? 'bg-[var(--mn-accent)] text-slate-950'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {m.progress}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Application Detailed Pipeline */}
      {activeMilestone && (
        <div className="bg-[var(--mn-surface)] rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          {/* Top Bar of Active Milestone */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  {activeMilestone.scholarshipTitle}
                </span>
                <span className="text-xs text-slate-500">{activeMilestone.country}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold mt-1">
                <span className="flex items-center gap-1 text-red-600 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  الموعد: {activeMilestone.deadline}
                </span>
                <span className="flex items-center gap-1 text-[var(--mn-heading)]">
                  <Clock className="w-3.5 h-3.5" />
                  المرحلة: {activeMilestone.stage}
                </span>
              </div>
            </div>

            {/* Delete tracker button */}
            <button
              onClick={() => onDeleteMilestone(activeMilestone.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="إزالة من قائمة المتابعة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick AI Shortcuts */}
          <div className="p-3 rounded-2xl bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
              <Sparkles className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>مساعدة الذكاء الاصطناعي</span>
            </div>
            {onOpenAiLetterForScholarship && (
              <button
                onClick={() => onOpenAiLetterForScholarship(activeMilestone.scholarshipTitle)}
                className="px-3 py-1 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] rounded-xl text-[10px] font-bold hover:bg-[var(--mn-primary-hover)] active:scale-95 transition-all cursor-pointer"
              >
                توليد خطاب دافع AI
              </button>
            )}
          </div>

          {/* Checklist of Application Requirements */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
              <span>قائمة المهام والملفات (Checklist)</span>
              <span className="text-[10px] text-slate-400 font-normal">اضغط للتحديث</span>
            </h4>

            <div className="space-y-2">
              {activeMilestone.checklist.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(activeMilestone.id, task.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-98 ${
                    task.completed
                      ? 'bg-[var(--mn-primary)]/5 border-[var(--mn-border-brand)]/30 text-slate-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--mn-heading)] fill-[var(--mn-primary)]/20 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through text-slate-400' : ''}>
                      {task.task}
                    </span>
                  </div>

                  {task.completed && (
                    <span className="text-[9px] font-bold text-[var(--mn-heading)] bg-[var(--mn-primary)]/10 px-2 py-0.5 rounded-full">
                      مكتمل ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Notes Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>ملاحظاتك الخاصة:</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {activeMilestone.notes || 'لا توجد ملاحظات مضافة بعد.'}
            </p>
          </div>
        </div>
      )}

      {/* Learner Enrolled Courses Section */}
      <div className="bg-[var(--mn-surface)] rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[var(--mn-heading)]" />
            <span>الدورات التأهيلية المسجلة</span>
          </h3>
          <span className="text-[10px] text-slate-400">منارة التعلم</span>
        </div>

        <div className="space-y-2.5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{course.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>{course.provider}</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="text-left shrink-0">
                <div className="text-[11px] font-bold text-[var(--mn-heading)] mb-1">
                  {course.progressPercent || 0}%
                </div>
                <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--mn-primary)] rounded-full"
                    style={{ width: `${course.progressPercent || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--mn-surface)] rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-[var(--mn-accent)]/30 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                إضافة منحة جديدة لنظام المتابعة
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر المنحة الدراسية:
              </label>
              <select
                value={newScholarshipId}
                onChange={(e) => setNewScholarshipId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[var(--mn-border-brand)]"
              >
                {allScholarships.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.countryFlag} {s.title} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات أو أهداف خاصة:
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                placeholder="مثلاً: التركيز على برنامج ماجستير الذكاء الاصطناعي وتجهيز مقترح البحث..."
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[var(--mn-border-brand)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleAddNewTracker}
                className="flex-1 py-2.5 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] font-bold text-xs rounded-xl shadow-md hover:bg-[var(--mn-primary-hover)] active:scale-95 transition-all cursor-pointer"
              >
                بدء المتابعة الآن
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="py-2.5 px-4 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
