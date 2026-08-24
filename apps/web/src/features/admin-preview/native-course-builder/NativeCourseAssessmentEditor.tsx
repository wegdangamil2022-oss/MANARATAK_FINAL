import { FormEvent, useState } from 'react';
import { ApiClient, CourseCurriculumSnapshotDto } from '../../../api/client';

export function NativeCourseAssessmentEditor({
  courseId,
  snapshot,
  locked,
  onRefresh,
  onError,
}: {
  courseId: string;
  snapshot: CourseCurriculumSnapshotDto;
  locked: boolean;
  onRefresh(): Promise<void>;
  onError(message: string): void;
}) {
  const [quiz, setQuiz] = useState({ title: '', passingScore: 70, maxAttempts: 3 });
  const [selectedQuiz, setSelectedQuiz] = useState(snapshot.quizzes[0]?.id ?? '');
  const [question, setQuestion] = useState({
    prompt: '',
    questionType: 'MULTIPLE_CHOICE',
    choices: '',
    correctAnswer: '',
    explanation: '',
    points: 1,
  });
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await onRefresh();
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'تعذر حفظ الاختبار');
    }
  };
  const createQuiz = (event: FormEvent) => {
    event.preventDefault();
    if (!quiz.title.trim()) return;
    void run(async () => {
      const created = await ApiClient.createCourseQuiz(courseId, {
        ...quiz,
        title: quiz.title.trim(),
        position: snapshot.quizzes.length + 1,
      });
      setSelectedQuiz(created.id);
      setQuiz({ title: '', passingScore: 70, maxAttempts: 3 });
    });
  };
  const createQuestion = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedQuiz || !question.prompt.trim()) return;
    const existing = snapshot.questions.filter((item) => item.quizId === selectedQuiz);
    const choices =
      question.questionType === 'MULTIPLE_CHOICE'
        ? question.choices
            .split('\n')
            .map((v) => v.trim())
            .filter(Boolean)
        : undefined;
    void run(async () => {
      await ApiClient.createCourseQuestion(courseId, {
        quizId: selectedQuiz,
        prompt: question.prompt.trim(),
        questionType: question.questionType,
        choices,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        points: question.points,
        position: existing.length + 1,
      });
      setQuestion({
        prompt: '',
        questionType: 'MULTIPLE_CHOICE',
        choices: '',
        correctAnswer: '',
        explanation: '',
        points: 1,
      });
    });
  };
  return (
    <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">الاختبارات</h2>
        <div className="mt-3 space-y-2">
          {snapshot.quizzes.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedQuiz(item.id)}
              className={`w-full rounded-xl p-3 text-start ${selectedQuiz === item.id ? 'bg-emerald-50 text-emerald-900' : 'border'}`}
            >
              <strong className="block text-sm">{item.title}</strong>
              <span className="text-xs text-slate-500">
                نجاح {item.passingScore ?? 0}% ·{' '}
                {snapshot.questions.filter((q) => q.quizId === item.id).length} أسئلة
              </span>
            </button>
          ))}
        </div>
        <form onSubmit={createQuiz} className="mt-4 space-y-2 border-t pt-4">
          <input
            disabled={locked}
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            placeholder="عنوان اختبار جديد"
            className="w-full rounded-xl border p-2.5"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              درجة النجاح
              <input
                type="number"
                min="0"
                max="100"
                value={quiz.passingScore}
                onChange={(e) => setQuiz({ ...quiz, passingScore: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>
            <label className="text-xs">
              المحاولات
              <input
                type="number"
                min="1"
                value={quiz.maxAttempts}
                onChange={(e) => setQuiz({ ...quiz, maxAttempts: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>
          </div>
          <button
            disabled={locked}
            className="w-full rounded-xl bg-[#044A37] p-2.5 text-sm font-bold text-white"
          >
            إضافة اختبار
          </button>
        </form>
      </aside>
      <div className="rounded-2xl border bg-white p-5">
        {selectedQuiz ? (
          <>
            <h2 className="text-lg font-bold">أسئلة الاختبار</h2>
            <div className="mt-4 space-y-2">
              {snapshot.questions
                .filter((item) => item.quizId === selectedQuiz)
                .map((item) => (
                  <article key={item.id} className="rounded-xl border p-3">
                    <div className="flex justify-between gap-3">
                      <strong className="text-sm">
                        {item.position}. {item.prompt}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {item.questionType} · {item.points} نقطة
                      </span>
                    </div>
                    {Array.isArray(item.choices) && (
                      <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                        {item.choices.map((choice, index) => (
                          <li key={index}>{String(choice)}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
            </div>
            <form onSubmit={createQuestion} className="mt-5 grid gap-3 border-t pt-5">
              <label className="text-sm font-medium">
                نوع السؤال
                <select
                  value={question.questionType}
                  onChange={(e) => setQuestion({ ...question, questionType: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3"
                >
                  <option value="MULTIPLE_CHOICE">اختيار من متعدد</option>
                  <option value="TRUE_FALSE">صح / خطأ</option>
                  <option value="SHORT_ANSWER">إجابة قصيرة</option>
                  <option value="ESSAY">مقالي</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                نص السؤال
                <textarea
                  value={question.prompt}
                  onChange={(e) => setQuestion({ ...question, prompt: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
              {question.questionType === 'MULTIPLE_CHOICE' && (
                <label className="text-sm font-medium">
                  الخيارات
                  <textarea
                    value={question.choices}
                    onChange={(e) => setQuestion({ ...question, choices: e.target.value })}
                    rows={4}
                    placeholder="خيار في كل سطر"
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>
              )}
              <label className="text-sm font-medium">
                الإجابة الصحيحة
                <input
                  value={question.correctAnswer}
                  onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
              <label className="text-sm font-medium">
                تفسير الإجابة
                <textarea
                  value={question.explanation}
                  onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
              <button
                disabled={locked}
                className="justify-self-start rounded-xl bg-[#044A37] px-5 py-2.5 font-bold text-white"
              >
                إضافة السؤال
              </button>
            </form>
          </>
        ) : (
          <div className="grid min-h-64 place-items-center text-slate-500">
            أنشئ اختبارًا لبدء إضافة الأسئلة.
          </div>
        )}
      </div>
    </section>
  );
}
