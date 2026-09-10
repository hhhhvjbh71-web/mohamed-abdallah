/**
 * تعيين الصفوف والمراحل الدراسية لمنصة الفيزياء (grade-mapping.js)
 */

window.GRADE_OPTIONS = [
  { value: '1', label: 'الصف الأول الثانوي' },
  { value: '2', label: 'الصف الثاني الثانوي' },
  { value: '3', label: 'الصف الثالث الثانوي' },
  { value: 'all', label: 'جميع المراحل' }
];

window.normalizeGrade = function(g) {
  if (!g) return 'all';
  var s = String(g).trim().toLowerCase();
  if (s.includes('أول') && s.includes('ثانو')) return '1';
  if (s.includes('ثان') && s.includes('ثانو')) return '2';
  if (s.includes('ثالث') && s.includes('ثانو')) return '3';
  if (s === '1' || s === 'sec-1') return '1';
  if (s === '2' || s === 'sec-2') return '2';
  if (s === '3' || s === 'sec-3') return '3';
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
  if (norm === '1') return 'grade1';
  if (norm === '2') return 'grade2';
  if (norm === '3') return 'grade3';
  return 'grade1';
};

window.isSecondaryGrade = function(g) {
  return true;
};

window.buildGradeOptions = function(sel, incAll) {
  var html = incAll ? '<option value="all">كل الصفوف</option>' : '<option value="">اختر الصف الدراسي</option>';
  window.GRADE_OPTIONS.forEach(function(opt) {
    if (opt.value === 'all') return;
    html += '<option value="' + opt.value + '"' + (opt.value === sel ? ' selected' : '') + '>' + opt.label + '</option>';
  });
  return html;
};

