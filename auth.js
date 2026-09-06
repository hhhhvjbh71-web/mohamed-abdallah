/**
 * منصة دكتور محمد عبد الله - عميد الفيزياء
 * ملف المصادقة (auth.js) - مع Firebase Firestore
 * إدارة التسجيل والدخول والتحقق من الشروط والتوجيه
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
  initPasswordToggles();
  initPhoneInputsRestriction();
});

/* ==========================================================================
   1. تقييد أرقام الهواتف بألا تتجاوز 11 رقماً وأن تكون أرقاماً فقط
   ========================================================================== */
function initPhoneInputsRestriction() {
  const phoneInputs = document.querySelectorAll('input[type="tel"], .phone-input');
  phoneInputs.forEach(input => {
    input.setAttribute('maxlength', '11');
    input.setAttribute('inputmode', 'numeric');
    
    input.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(0, 11);
    });
  });

  const passwordInputs = document.querySelectorAll('.numeric-password');
  passwordInputs.forEach(input => {
    input.setAttribute('maxlength', '6');
    input.setAttribute('inputmode', 'numeric');
    input.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
  });
}

/* ==========================================================================
   2. إظهار وإخفاء كلمات المرور
   ========================================================================== */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');

      const icon = btn.querySelector('svg');
      if (icon) {
        if (isPassword) {
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          `;
        } else {
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
        }
      }
    });
  });
}

/* ==========================================================================
   3. جلب مرجع Firestore مع الانتظار لحين التهيئة
   ========================================================================== */
function waitForFirestore(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      if (window.db) {
        resolve(window.db);
        return;
      }
      if (Date.now() - start > timeout) {
        reject(new Error('Firestore لم يتم تهيئته في الوقت المحدد'));
        return;
      }
      setTimeout(check, 100);
    }
    check();
  });
}

/* ==========================================================================
   4. التحقق من صحة ومعالجة نموذج إنشاء الحساب (Register Form)
   ========================================================================== */
function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullNameInput    = document.getElementById('regFullName');
    const phoneInput       = document.getElementById('regPhone');
    const parentPhoneInput = document.getElementById('regParentPhone');
    const gradeSelect      = document.getElementById('regGrade');
    const govSelect        = document.getElementById('regGov');
    const passwordInput    = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    const submitBtn        = document.getElementById('btnSubmitRegister');

    let isValid = true;

    // 1. الاسم ثلاثي
    const nameTrimmed = fullNameInput.value.trim();
    const nameWords   = nameTrimmed.split(/\s+/).filter(Boolean);
    if (nameWords.length < 3) {
      showFieldError(fullNameInput, 'يرجى كتابة الاسم ثلاثي بالكامل (مثال: أحمد محمد علي)');
      isValid = false;
    } else {
      clearFieldError(fullNameInput);
    }

    // 2. رقم هاتف الطالب
    const phoneVal = phoneInput.value.trim();
    if (!/^01[0125][0-9]{8}$/.test(phoneVal)) {
      showFieldError(phoneInput, 'يجب أن يكون رقم الهاتف مكوناً من 11 رقماً صحيحاً (مثال: 01012345678)');
      isValid = false;
    } else {
      clearFieldError(phoneInput);
    }

    // 3. رقم هاتف ولي الأمر
    const parentPhoneVal = parentPhoneInput.value.trim();
    if (!/^01[0125][0-9]{8}$/.test(parentPhoneVal)) {
      showFieldError(parentPhoneInput, 'يجب إدخال رقم هاتف ولي الأمر 11 رقماً صحيحاً');
      isValid = false;
    } else if (parentPhoneVal === phoneVal) {
      showFieldError(parentPhoneInput, 'رقم هاتف ولي الأمر يجب ألا يتطابق مع رقم هاتف الطالب');
      isValid = false;
    } else {
      clearFieldError(parentPhoneInput);
    }

    // 4. الصف الدراسي
    if (!gradeSelect.value) {
      showFieldError(gradeSelect, 'يرجى اختيار الصف الدراسي');
      isValid = false;
    } else {
      clearFieldError(gradeSelect);
    }

    // 5. المحافظة
    if (!govSelect.value) {
      showFieldError(govSelect, 'يرجى اختيار المحافظة');
      isValid = false;
    } else {
      clearFieldError(govSelect);
    }

    // 6. كلمة المرور
    const passwordVal = passwordInput.value.trim();
    if (!/^\d{6}$/.test(passwordVal)) {
      showFieldError(passwordInput, 'كلمة المرور يجب أن تتكون من 6 أرقام بالضبط');
      isValid = false;
    } else {
      clearFieldError(passwordInput);
    }

    // 7. تأكيد كلمة المرور
    const confirmPasswordVal = confirmPasswordInput.value.trim();
    if (confirmPasswordVal !== passwordVal) {
      showFieldError(confirmPasswordInput, 'كلمة المرور غير متطابقة، تأكد من إدخال الـ 6 أرقام نفسها');
      isValid = false;
    } else {
      clearFieldError(confirmPasswordInput);
    }

    if (!isValid) {
      showToast('يرجى تصحيح الأخطاء الموضحة في النموذج', 'error');
      return;
    }

    // تحميل + تعطيل الزر
    setBtnLoading(submitBtn, true, 'جاري التسجيل...');

    try {
      const db = await waitForFirestore();

      // فحص إذا كان الرقم مسجلاً مسبقاً في Firebase
      const existingSnap = await db.collection('students')
        .where('phone', '==', phoneVal)
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        showFieldError(phoneInput, 'هذا الرقم مسجل به حساب بالفعل، يرجى تسجيل الدخول');
        showToast('هذا الرقم مسجل به حساب بالفعل، يمكنك تسجيل الدخول مباشرة', 'error');
        setBtnLoading(submitBtn, false, 'إنشاء حساب والبدء فوراً');
        return;
      }

      // إنشاء الطالب الجديد في Firestore
      const newUser = {
        name:          nameTrimmed,
        phone:         phoneVal,
        parentPhone:   parentPhoneVal,
        grade:         gradeSelect.value,
        governorate:   govSelect.value,
        password:      passwordVal,
        role:          'student',
        isActive:      true,
        enrolledCourses: [],
        registeredAt:  firebase.firestore.FieldValue.serverTimestamp(),
        registeredAtISO: new Date().toISOString()
      };

      const docRef = await db.collection('students').add(newUser);

      // حفظ جلسة المستخدم في localStorage
      const sessionUser = { ...newUser, id: docRef.id, registeredAt: new Date().toISOString() };
      delete sessionUser.password; // لا نحفظ كلمة المرور في الجلسة
      localStorage.setItem('physics_current_user', JSON.stringify(sessionUser));
      localStorage.setItem('physics_session_id', docRef.id);

      showToast(`🎉 مرحباً بك يا بطل الفيزياء! تم إنشاء حسابك بنجاح`, 'success');

      setTimeout(() => {
        redirectAfterAuth();
      }, 1200);

    } catch (err) {
      console.error('❌ خطأ في التسجيل:', err);

      // إذا فشل Firebase استخدم LocalStorage كـ Fallback
      if (err.message && err.message.includes('Firestore')) {
        showToast('⚠️ فشل الاتصال بالسيرفر، جاري الحفظ محلياً...', 'error');
        registerLocalFallback({ nameTrimmed, phoneVal, parentPhoneVal, gradeSelect, govSelect, passwordVal });
      } else {
        showToast('❌ حدث خطأ أثناء التسجيل: ' + err.message, 'error');
      }

      setBtnLoading(submitBtn, false, 'إنشاء حساب والبدء فوراً');
    }
  });
}

/** Fallback محلي عند فشل Firebase */
function registerLocalFallback({ nameTrimmed, phoneVal, parentPhoneVal, gradeSelect, govSelect, passwordVal }) {
  const existingUsers = JSON.parse(localStorage.getItem('physics_users') || '[]');
  const userExists = existingUsers.some(u => u.phone === phoneVal);
  if (userExists) {
    showToast('هذا الرقم مسجل به حساب بالفعل', 'error');
    return;
  }
  const newUser = {
    name: nameTrimmed,
    phone: phoneVal,
    parentPhone: parentPhoneVal,
    grade: gradeSelect.value,
    governorate: govSelect.value,
    password: passwordVal,
    registeredAt: new Date().toISOString()
  };
  existingUsers.push(newUser);
  localStorage.setItem('physics_users', JSON.stringify(existingUsers));
  localStorage.setItem('physics_current_user', JSON.stringify(newUser));
  showToast('تم إنشاء الحساب بنجاح (وضع محلي)', 'success');
  setTimeout(() => redirectAfterAuth(), 1200);
}

/* ==========================================================================
   5. التحقق من نموذج تسجيل الدخول (Login Form) مع Firebase
   ========================================================================== */
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneInput    = document.getElementById('loginPhone');
    const passwordInput = document.getElementById('loginPassword');
    const submitBtn     = document.getElementById('btnSubmitLogin');

    let isValid = true;
    const phoneVal    = phoneInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    if (!phoneVal) {
      showFieldError(phoneInput, 'يرجى إدخال رقم الهاتف');
      isValid = false;
    } else {
      clearFieldError(phoneInput);
    }

    if (!passwordVal || !/^\d{6}$/.test(passwordVal)) {
      showFieldError(passwordInput, 'يرجى إدخال كلمة المرور المكونة من 6 أرقام');
      isValid = false;
    } else {
      clearFieldError(passwordInput);
    }

    if (!isValid) return;

    setBtnLoading(submitBtn, true, 'جاري التحقق...');

    try {
      const db = await waitForFirestore();

      // البحث عن الطالب في Firebase
      const snap = await db.collection('students')
        .where('phone', '==', phoneVal)
        .where('password', '==', passwordVal)
        .limit(1)
        .get();

      if (snap.empty) {
        // محاولة إيجاد الطالب عبر الهاتف فقط للتمييز بين خطأ الهاتف وخطأ الرمز
        const phoneSnap = await db.collection('students')
          .where('phone', '==', phoneVal)
          .limit(1)
          .get();

        if (phoneSnap.empty) {
          showFieldError(phoneInput, 'رقم الهاتف غير مسجل في المنصة');
          showToast('رقم الهاتف غير مسجل، يمكنك إنشاء حساب جديد', 'error');
        } else {
          showFieldError(passwordInput, 'كلمة المرور غير صحيحة');
          showToast('كلمة المرور غير صحيحة، حاول مرة أخرى', 'error');
        }
        setBtnLoading(submitBtn, false, 'تسجيل الدخول');
        return;
      }

      // تسجيل الدخول بنجاح
      const userDoc  = snap.docs[0];
      const userData = userDoc.data();

      // التحقق من أن الحساب مفعل
      if (userData.isActive === false) {
        showToast('⛔ حسابك موقوف مؤقتاً، تواصل مع الدعم الفني', 'error');
        setBtnLoading(submitBtn, false, 'تسجيل الدخول');
        return;
      }

      const sessionUser = {
        id:          userDoc.id,
        name:        userData.name,
        phone:       userData.phone,
        parentPhone: userData.parentPhone,
        grade:       userData.grade,
        governorate: userData.governorate,
        role:        userData.role || 'student',
        isActive:    userData.isActive,
        enrolledCourses: userData.enrolledCourses || []
      };

      localStorage.setItem('physics_current_user', JSON.stringify(sessionUser));
      localStorage.setItem('physics_session_id', userDoc.id);

      // تحديث آخر دخول في Firebase
      try {
        await db.collection('students').doc(userDoc.id).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginISO: new Date().toISOString()
        });
      } catch(updateErr) {
        console.warn('تحديث آخر دخول فشل:', updateErr);
      }

      showToast(`✅ تم تسجيل الدخول بنجاح! مرحباً ${userData.name.split(' ')[0]} 🎉`, 'success');

      setTimeout(() => {
        redirectAfterAuth();
      }, 1000);

    } catch (err) {
      console.error('❌ خطأ في تسجيل الدخول:', err);

      // Fallback إلى LocalStorage
      const allUsers = JSON.parse(localStorage.getItem('physics_users') || '[]');

      // حساب تجريبي افتراضي
      if (allUsers.length === 0) {
        allUsers.push({
          name: 'أحمد محمود عبد الرحمن',
          phone: '01012345678',
          parentPhone: '01112345678',
          grade: 'الصف الثالث الثانوي',
          governorate: 'القاهرة',
          password: '123456'
        });
        localStorage.setItem('physics_users', JSON.stringify(allUsers));
      }

      const userMatch = allUsers.find(u => u.phone === phoneVal && u.password === passwordVal);
      if (userMatch) {
        localStorage.setItem('physics_current_user', JSON.stringify(userMatch));
        showToast(`✅ تم تسجيل الدخول! مرحباً ${userMatch.name.split(' ')[0]}`, 'success');
        setTimeout(() => redirectAfterAuth(), 1000);
      } else {
        showToast('❌ حدث خطأ في الاتصال، تأكد من اتصالك بالإنترنت', 'error');
        setBtnLoading(submitBtn, false, 'تسجيل الدخول');
      }
    }
  });
}

/* ==========================================================================
   6. دوال مساعدة
   ========================================================================== */
function setBtnLoading(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  const span = btn.querySelector('span') || btn;
  if (isLoading) {
    btn.dataset.originalText = span.textContent;
    span.textContent = text || 'جاري التحميل...';
    btn.style.opacity = '0.7';
    btn.style.cursor  = 'not-allowed';
  } else {
    span.textContent  = btn.dataset.originalText || text || 'إرسال';
    btn.style.opacity = '';
    btn.style.cursor  = '';
  }
}

function showFieldError(inputElement, message) {
  inputElement.classList.add('error');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    let errorEl = parent.querySelector('.field-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error-msg';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function clearFieldError(inputElement) {
  inputElement.classList.remove('error');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    const errorEl = parent.querySelector('.field-error-msg');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }
}

function redirectAfterAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('returnUrl');
  if (returnUrl) {
    window.location.href = decodeURIComponent(returnUrl);
  } else {
    window.location.href = 'index.html';
  }
}
