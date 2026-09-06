/**
 * تعيين الصفوف والمراحل الدراسية لمنصة الفيزياء (grade-mapping.js)
 */

window.GRADE_OPTIONS = [
  { value: '1prep', label: 'الصف الأول الإعدادي' },
  { value: '2prep', label: 'الصف الثاني الإعدادي' },
  { value: '3prep', label: 'الصف الثالث الإعدادي' },
  { value: '1', label: 'الصف الأول الثانوي' },
  { value: '2', label: 'الصف الثاني الثانوي' },
  { value: '3', label: 'الصف الثالث الثانوي' },
  { value: 'all', label: 'جميع المراحل' }
];

window.normalizeGrade = function(g) {
  if (!g) return 'all';
  var s = String(g).trim().toLowerCase();
  if (s.includes('أول') && s.includes('إعداد')) return '1prep';
  if (s.includes('ثان') && s.includes('إعداد')) return '2prep';
  if (s.includes('ثالث') && s.includes('إعداد')) return '3prep';
  if (s.includes('أول') && s.includes('ثانو')) return '1';
  if (s.includes('ثان') && s.includes('ثانو')) return '2';
  if (s.includes('ثالث') && s.includes('ثانو')) return '3';
  if (s === '1' || s === 'sec-1') return '1';
  if (s === '2' || s === 'sec-2') return '2';
  if (s === '3' || s === 'sec-3') return '3';
  if (s === 'prep-1' || s === '1prep') return '1prep';
  if (s === 'prep-2' || s === '2prep') return '2prep';
  if (s === 'prep-3' || s === '3prep') return '3prep';
  return g;
};

window.gradeLabel = function(g) {
  var norm = window.normalizeGrade(g);
  for (var i = 0; i < window.GRADE_OPTIONS.length; i++) {
    if (window.GRADE_OPTIONS[i].value === norm) return window.GRADE_OPTIONS[i].label;
  }
  return g || '—';
};

window.gradeClass = function(g) {
  var norm = window.normalizeGrade(g);
  if (norm === '1' || norm === '1prep') return 'grade1';
  if (norm === '2' || norm === '2prep') return 'grade2';
  if (norm === '3' || norm === '3prep') return 'grade3';
  return 'grade1';
};

window.isSecondaryGrade = function(g) {
  var norm = window.normalizeGrade(g);
  return norm === '1' || norm === '2' || norm === '3';
};
