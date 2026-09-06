/**
 * أداة حفظ واسترجاع النسخ الاحتياطية من Firebase (firebase-snapshot.js)
 */

window.saveFirebaseSnapshot = async function() {
  if (!window.db) {
    alert('Firebase غير متصل حالياً');
    return;
  }
  try {
    const studentsSnap = await window.db.collection('students').get();
    const students = [];
    studentsSnap.forEach(doc => students.push({ id: doc.id, ...doc.data() }));

    const coursesSnap = await window.db.collection('platform_data').doc('courses_list').get();
    const courses = coursesSnap.exists ? coursesSnap.data().courses || [] : [];

    const backupData = {
      timestamp: new Date().toISOString(),
      platform: 'دكتور محمد عبد الله - عميد الفيزياء',
      studentsCount: students.length,
      coursesCount: courses.length,
      students,
      courses
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof showNotification === 'function') {
      showNotification('✅ تم تحميل النسخة الاحتياطية بنجاح', 'success');
    } else {
      alert('تم تحميل النسخة الاحتياطية بنجاح');
    }
  } catch(e) {
    console.error('Error saving snapshot:', e);
    alert('حدث خطأ أثناء حفظ النسخة: ' + e.message);
  }
};
