/**
 * منصة دكتور محمد عبد الله - عميد الفيزياء
 * ملف الجافاسكريبت الرئيسي (main.js)
 * إدارة الثيم، القائمة الجانبية، مؤثرات الفيزياء، والكورسات
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initMobileDrawer();
  initPhysicsBackground();
  initCourseFilters();
  initAuthState();
  initCourseActions();
});

/* ==========================================================================
   1. إدارة الثيم (الوضع الليلي والنهاري)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('physics_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('physics_theme', newTheme);
      
      showToast(`تم التبديل إلى ${newTheme === 'dark' ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️'}`, 'info', 2000);
    });
  });
}

/* ==========================================================================
   2. تفاعل الهيدر عند التمرير
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   3. القائمة الجانبية وزر الهامبورجر (Mobile Drawer)
   ========================================================================== */
function initMobileDrawer() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  
  if (!hamburgerBtn || !mobileDrawer || !drawerOverlay) return;

  function toggleDrawer() {
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  function openDrawer() {
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', toggleDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // إغلاق القائمة عند النقر على أي رابط بداخلها
  const drawerLinks = mobileDrawer.querySelectorAll('.drawer-link, .btn');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   4. خلفية الفيزياء الحقيقية: خطوط المجال المغناطيسي + الموجات الكهرومغناطيسية + الكهرباء
   ========================================================================== */
function initPhysicsBackground() {
  const canvas = document.getElementById('physicsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // موقع مؤشر الفأرة كقطب مغناطيسي تفاعلي
  const mouse = {
    x: width / 2,
    y: height / 2,
    isActive: false,
    speed: 0,
    lastX: width / 2,
    lastY: height / 2
  };

  window.addEventListener('mousemove', (e) => {
    mouse.isActive = true;
    const dx = e.clientX - mouse.lastX;
    const dy = e.clientY - mouse.lastY;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  // شحنات وإلكترونات سريعة تتحرك بتأثير قوة لورنتز والمجال المغناطيسي
  const electronCount = Math.min(Math.floor(window.innerWidth / 35), 32);
  const electrons = [];

  class Electron {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 2.2;
      this.vy = (Math.random() - 0.5) * 2.2;
      this.radius = Math.random() * 2 + 1.5;
      this.charge = Math.random() > 0.4 ? -1 : 1; // إلكترون سالب أو شحنة موجبة
      this.trail = [];
      this.maxTrail = 10;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() * 0.05 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
      // انحناء المسار بتأثير المجال المغناطيسي (Lorentz Force: F = q(v x B))
      this.angle += this.spinSpeed;
      this.vx += Math.cos(this.angle) * 0.12;
      this.vy += Math.sin(this.angle) * 0.12;

      // تقييد السرعة
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 3) {
        this.vx = (this.vx / speed) * 3;
        this.vy = (this.vy / speed) * 3;
      }

      // الجذب والتنافر التفاعلي مع مغناطيس الفأرة
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 10) {
          const force = (220 - dist) / 220 * 0.18;
          // شحنات تتجاذب وأخرى تدور في مسار لولبي مغناطيسي
          this.vx += (dx / dist) * force * this.charge;
          this.vy += (dy / dist) * force * this.charge;
          // عزم لولبي (قوة مغناطيسية متعامدة)
          this.vx += (-dy / dist) * force * 0.8;
          this.vy += (dx / dist) * force * 0.8;
        }
      }

      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -30) this.x = width + 30;
      if (this.x > width + 30) this.x = -30;
      if (this.y < -30) this.y = height + 30;
      if (this.y > height + 30) this.y = -30;
    }

    draw(isDark) {
      // ذيل الشحنة المتوهج (Glowing Trail)
      if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.charge < 0
          ? (isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)') // أزرق للإلكترون
          : (isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(220, 38, 38, 0.25)'); // أحمر للشحنة الموجبة
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // جسم الشحنة مع وهج هالي
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.charge < 0
        ? (isDark ? '#38bdf8' : '#0284c7')
        : (isDark ? '#f87171' : '#dc2626');
      ctx.shadowColor = this.charge < 0 ? '#38bdf8' : '#ef4444';
      ctx.shadowBlur = isDark ? 8 : 4;
      ctx.fill();
      ctx.shadowBlur = 0; // إعادة ضبط
    }
  }

  for (let i = 0; i < electronCount; i++) {
    electrons.push(new Electron());
  }

  // شرارات كهربية وتفريغ كهربي خفيف (Electric Spark Arcs)
  let electricSparks = [];
  function createRandomSpark() {
    if (Math.random() < 0.04) {
      const p1 = electrons[Math.floor(Math.random() * electrons.length)];
      const p2 = electrons[Math.floor(Math.random() * electrons.length)];
      if (p1 && p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 50 && dist < 190) {
          electricSparks.push({
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            life: 1.0,
            color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24'
          });
        }
      }
    }
  }

  function drawElectricArc(spark, isDark) {
    ctx.beginPath();
    ctx.moveTo(spark.x1, spark.y1);
    
    // مسار متعرج للشرارة الكهربائية (Zigzag Lightning)
    const segments = 4;
    let currX = spark.x1;
    let currY = spark.y1;
    const dx = (spark.x2 - spark.x1) / segments;
    const dy = (spark.y2 - spark.y1) / segments;

    for (let i = 1; i < segments; i++) {
      const jitter = (Math.random() - 0.5) * 16;
      currX += dx + jitter;
      currY += dy + jitter;
      ctx.lineTo(currX, currY);
    }
    ctx.lineTo(spark.x2, spark.y2);

    ctx.strokeStyle = spark.color;
    ctx.globalAlpha = spark.life * (isDark ? 0.75 : 0.5);
    ctx.lineWidth = 1.4;
    ctx.shadowColor = spark.color;
    ctx.shadowBlur = isDark ? 10 : 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  }

  // رسم خطوط المجال المغناطيسي الانسيابية (Magnetic Dipole Curves)
  function drawMagneticFieldLines(isDark, time) {
    const poles = [
      { x: width * 0.25, y: height * 0.35, sign: 1 },  // قطب N
      { x: width * 0.75, y: height * 0.65, sign: -1 }  // قطب S
    ];

    // إضافة قطب الفأرة في حال حرك المستخدم الفأرة
    if (mouse.isActive) {
      poles.push({ x: mouse.x, y: mouse.y, sign: 1.5 });
    }

    const lineCount = 6;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]); // خطوط فيض منقطة كالمغناطيسية

    for (let i = 0; i < lineCount; i++) {
      const offset = (i - lineCount / 2) * 50;
      const phase = time * 0.0015 + i;

      ctx.beginPath();
      const startX = width * 0.1;
      const startY = height * 0.3 + offset + Math.sin(phase) * 25;
      const cp1X = width * 0.4;
      const cp1Y = height * 0.1 + offset * 1.5 + Math.cos(phase) * 35;
      const cp2X = width * 0.6;
      const cp2Y = height * 0.9 - offset * 1.5 - Math.sin(phase) * 35;
      const endX = width * 0.9;
      const endY = height * 0.7 - offset - Math.cos(phase) * 25;

      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

      ctx.strokeStyle = isDark
        ? `rgba(56, 189, 248, ${0.12 + Math.sin(phase) * 0.05})`
        : `rgba(2, 132, 199, ${0.08 + Math.sin(phase) * 0.04})`;
      ctx.stroke();
    }

    ctx.setLineDash([]); // إعادة الخط المتصل
  }

  // رسم الموجات الكهرومغناطيسية الجيبية (Electromagnetic Sine Waves)
  function drawElectromagneticWaves(isDark, time) {
    const waves = [
      { y: height * 0.45, amp: 26, freq: 0.006, speed: 0.002, color: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.12)', width: 1.6 },
      { y: height * 0.45, amp: 18, freq: 0.008, speed: -0.0025, color: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(99, 102, 241, 0.1)', width: 1.2 },
      { y: height * 0.78, amp: 22, freq: 0.005, speed: 0.0018, color: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(217, 119, 6, 0.08)', width: 1.4 }
    ];

    waves.forEach(w => {
      ctx.beginPath();
      ctx.lineWidth = w.width;
      ctx.strokeStyle = w.color;
      for (let x = 0; x < width; x += 8) {
        const waveY = w.y + Math.sin(x * w.freq + time * w.speed) * w.amp;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    });
  }

  // حلقة التحريك (Physics Animation Loop)
  let lastTime = 0;
  function animate(timestamp) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.clearRect(0, 0, width, height);

    // 1. رسم خطوط المجال المغناطيسي
    drawMagneticFieldLines(isDark, timestamp);

    // 2. رسم الموجات الكهرومغناطيسية والتردد
    drawElectromagneticWaves(isDark, timestamp);

    // 3. تحديث ورسم الإلكترونات والشحنات
    for (let i = 0; i < electrons.length; i++) {
      electrons[i].update();
      electrons[i].draw(isDark);
    }

    // 4. توليد ورسم الشرارات الكهرومغناطيسية والتفريغ
    createRandomSpark();
    for (let i = electricSparks.length - 1; i >= 0; i--) {
      drawElectricArc(electricSparks[i], isDark);
      electricSparks[i].life -= 0.15;
      if (electricSparks[i].life <= 0) {
        electricSparks.splice(i, 1);
      }
    }

    // 5. تأثير هالة القطب المغناطيسي عند الفأرة
    if (mouse.isActive) {
      ctx.beginPath();
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 5, mouse.x, mouse.y, 90);
      grad.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.18)');
      grad.addColorStop(0.5, isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(245, 158, 11, 0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* ==========================================================================
   5. فلترة الكورسات حسب الصف الدراسي
   ========================================================================== */
function initCourseFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  if (!filterTabs.length) return;

  filterTabs.forEach(tab => {
    tab.onclick = () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetFilter = tab.getAttribute('data-filter');
      const courseCards = document.querySelectorAll('.course-card');

      courseCards.forEach(card => {
        const cardGrade = card.getAttribute('data-grade');
        if (targetFilter === 'all' || cardGrade === targetFilter) {
          card.style.display = 'flex';
          card.style.animation = 'zoomIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    };
  });
}

/* ==========================================================================
   6. حالة تسجيل الدخول وتحديث الهيدر
   ========================================================================== */
function initAuthState() {
  const currentUserJson = localStorage.getItem('physics_current_user');
  const authButtonsContainer = document.querySelectorAll('.auth-nav-buttons');
  
  if (!currentUserJson) return;

  try {
    const user = JSON.parse(currentUserJson);
    if (!user || !user.name) return;

    // استخراج الاسم الأول
    const firstName = user.name.split(' ')[0] || user.name;
    const initial = firstName.charAt(0);

    authButtonsContainer.forEach(container => {
      container.innerHTML = `
        <div class="user-profile-badge">
          <a href="profile.html" class="user-profile-link" title="عرض وتعديل الملف الشخصي" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:inherit;">
            <div class="user-avatar" style="cursor:pointer; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" title="الملف الشخصي">${initial}</div>
            <span class="user-name" style="cursor:pointer;">أهلاً، ${firstName}</span>
          </a>
          <a href="#" class="logout-link" title="تسجيل الخروج" onclick="logoutUser(event)">خروج</a>
        </div>
      `;
    });
  } catch (err) {
    console.error('Error parsing current user', err);
  }
}

window.logoutUser = function(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('physics_current_user');
  showToast('تم تسجيل الخروج بنجاح', 'info', 2000);
  setTimeout(() => {
    window.location.reload();
  }, 800);
};

/* ==========================================================================
   7. تفاعل فتح الكورسات والانتقال إلى صفحة الدروس (Lessons)
   ========================================================================== */
function initCourseActions() {
  // ربط بطاقات الكورسات بالكامل للانتقال إلى صفحة الدروس مع التحقق من تسجيل الدخول
  const attachCardEvents = () => {
    const cards = document.querySelectorAll('.course-card');
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      
      const enrollBtn = card.querySelector('.btn-course-enroll');
      const courseId = (enrollBtn && enrollBtn.getAttribute('data-course-id')) || card.id.replace('course-', '') || 'sec1';
      
      card.onclick = (e) => {
        // تجنب التكرار إذا تم النقر على زر الاشتراك مباشرة
        if (e.target.closest('.btn-course-enroll')) return;
        const targetUrl = `lessons.html?id=${encodeURIComponent(courseId)}`;
        const currentUser = localStorage.getItem('physics_current_user');
        if (!currentUser) {
          window.location.href = `login.html?returnUrl=${encodeURIComponent(targetUrl)}`;
          return;
        }
        window.location.href = targetUrl;
      };
    });

    const buttons = document.querySelectorAll('.btn-course-enroll');
    buttons.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const courseId = btn.getAttribute('data-course-id') || 'sec1';
        const targetUrl = `lessons.html?id=${encodeURIComponent(courseId)}`;
        const currentUser = localStorage.getItem('physics_current_user');
        if (!currentUser) {
          window.location.href = `login.html?returnUrl=${encodeURIComponent(targetUrl)}`;
          return;
        }
        window.location.href = targetUrl;
      };
    });
  };

  attachCardEvents();

  // جلب الكورسات الديناميكية المنشأة من لوحة التحكم (Dashboard)
  syncDynamicCourses(attachCardEvents);
}

/**
 * جلب الكورسات الديناميكية من Firebase أو LocalStorage وإضافتها للصفحة
 */
async function syncDynamicCourses(onDone) {
  let customCourses = null;
  try {
    if (window.db) {
      const doc = await window.db.collection('platform_data').doc('courses_list').get();
      if (doc.exists) {
        const data = doc.data() || {};
        const list = Array.isArray(data.items) ? data.items : (Array.isArray(data.courses) ? data.courses : []);
        if (list.length > 0) customCourses = list;
      }
    }
  } catch(e) {
    console.warn('[main.js] Firebase custom courses check:', e.message);
  }

  if (!customCourses || !customCourses.length) {
    try {
      customCourses = JSON.parse(localStorage.getItem('alsaqr_courses') || '[]');
    } catch(e) { customCourses = []; }
  }

  if (customCourses && customCourses.length > 0) {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    // خريطة لتحديد الكلاس الخاص بالصف
    const gradeClassMap = {
      '1': 'sec-1', 'sec1': 'sec-1', 'sec-1': 'sec-1',
      '2': 'sec-2', 'sec2': 'sec-2', 'sec-2': 'sec-2',
      '3': 'sec-3', 'sec3': 'sec-3', 'sec-3': 'sec-3',
      'prep-1': 'prep-1', '1prep': 'prep-1', 'prep1': 'prep-1',
      'prep-2': 'prep-2', '2prep': 'prep-2', 'prep2': 'prep-2',
      'prep-3': 'prep-3', '3prep': 'prep-3', 'prep3': 'prep-3'
    };

    const gradeNameMap = {
      '1': 'أولى ثانوي', 'sec-1': 'أولى ثانوي', 'sec1': 'أولى ثانوي',
      '2': 'تانية ثانوي', 'sec-2': 'تانية ثانوي', 'sec2': 'تانية ثانوي',
      '3': 'تالتة ثانوي', 'sec-3': 'تالتة ثانوي', 'sec3': 'تالتة ثانوي',
      'prep-1': 'أولى إعدادي', '1prep': 'أولى إعدادي', 'prep1': 'أولى إعدادي',
      'prep-2': 'تانية إعدادي', '2prep': 'تانية إعدادي', 'prep2': 'تانية إعدادي',
      'prep-3': 'تالتة إعدادي', '3prep': 'تالتة إعدادي', 'prep3': 'تالتة إعدادي'
    };

    // تحديث شبكة الكورسات من Firebase
    grid.innerHTML = customCourses.map((c, i) => {
      const gradeClass = gradeClassMap[c.grade] || 'sec-3';
      const gradeName = gradeNameMap[c.grade] || c.grade || 'مرحلة ثانوية';
      const isFree = c.type === 'free';
      const lessonsCount = (c.lessons && c.lessons.length) || 0;
      const thumb = c.thumbnail ? `<img src="${c.thumbnail}" alt="${c.title}" style="width:100%;height:100%;object-fit:cover;">` : `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      `;

      return `
        <article class="course-card" data-grade="${gradeClass}" id="course-${c.id}" style="animation: zoomIn 0.35s ease;">
          <div class="course-banner">
            <div class="course-banner-pattern"></div>
            <div class="course-physics-icon">
              ${thumb}
            </div>
            <span class="course-grade-badge">${gradeName}</span>
            <span class="course-price-badge" style="background:${isFree ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}; color:${isFree ? '#34d399' : '#fbbf24'}; border-color:${isFree ? '#059669' : '#d97706'}">
              ${isFree ? '🆓 مجاني' : `🔒 ${c.price ? c.price + ' ج.م' : 'اشتراك شهري'}`}
            </span>
          </div>
          <div class="course-body">
            <div class="course-meta">
              <span class="course-meta-item">📚 ${lessonsCount} درس</span>
              <span class="course-meta-item">⏱️ شرح متكامل</span>
              <span class="course-meta-item">⭐ 5.0</span>
            </div>
            <h3 class="course-title">${c.title}</h3>
            <p class="course-desc">${c.desc || 'شرح فيزيائي وافٍ وتدريبات وامتحانات دورية مع دكتور محمد عبد الله.'}</p>
            <div class="course-footer">
              <button type="button" class="btn btn-primary btn-course-enroll" data-course-id="${c.id}" data-course-title="${c.title}" style="width: 100%;">
                ${isFree ? 'دخول الكورس مجاناً 🚀' : 'فتح الكورس والمحتوى 🔑'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (typeof onDone === 'function') onDone();
    initCourseFilters();
  }
}

/* ==========================================================================
   8. نظام الإشعارات المنبثقة (Toast System)
   ========================================================================== */
window.showToast = function(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

/* ==========================================================================
   الدخول السريع للوحة التحكم للإدارة (Admin Quick Login)
   ========================================================================== */
window.enterAdminDashboard = function() {
  const adminUser = {
    id: 'admin_dr_mohamed',
    name: 'د. محمد عبد الله (الإدارة)',
    phone: 'admin',
    role: 'admin',
    isAdmin: true,
    isActive: true,
    grade: 'all',
    governorate: 'القيادة والتحكم',
    enrolledCourses: ['all']
  };
  localStorage.setItem('physics_current_user', JSON.stringify(adminUser));
  localStorage.setItem('physics_session_id', 'admin_dr_mohamed');
  localStorage.setItem('dr_is_admin', 'true');
  localStorage.setItem('alsaqr_admin_logged', 'true');
  window.location.href = 'dashboard.html';
};

