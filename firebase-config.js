/**
 * إعدادات Firebase لمنصة دكتور محمد عبد الله - عميد الفيزياء
 * تم ربط المنصة ولوحة التحكم (dashboard.html) بقاعدة البيانات السحابية الجديدة
 */

const firebaseConfig = {
  apiKey: "AIzaSyC1EpL1RRBZvEo6b2j8mkOV-H0Tln5y7jA",
  authDomain: "mohamed-abdallah-bff4a.firebaseapp.com",
  projectId: "mohamed-abdallah-bff4a",
  storageBucket: "mohamed-abdallah-bff4a.firebasestorage.app",
  messagingSenderId: "1022413740065",
  appId: "1:1022413740065:web:7c824f97629c4a9fa5eb60",
  measurementId: "G-8B8QP38G6L"
};

// تهيئة Firebase بالنمط المتوافق (Compat) لدعم لوحة التحكم وكافة الصفحات
if (typeof firebase !== 'undefined') {
  if (!firebase.apps || !firebase.apps.length) {
    try {
      window.firebaseApp = firebase.initializeApp(firebaseConfig);
    } catch (e) {
      console.warn("⚠️ [Firebase] Init error (app might exist):", e);
      window.firebaseApp = firebase.app();
    }
  } else {
    window.firebaseApp = firebase.app();
  }

  // قاعدة بيانات Firestore
  try {
    window.db = firebase.firestore();
    // توحيد المراجع لكي يعمل كل من db و dbNew القديم في الداشبورد على القاعدة الجديدة
    window.dbNew = window.db;
  } catch (e) {
    console.error("❌ [Firebase] Firestore initialization failed:", e);
  }

  // نظام المصادقة Auth
  try {
    if (firebase.auth) {
      window.auth = firebase.auth();
    }
  } catch (e) {
    console.warn("⚠️ [Firebase] Auth init error:", e);
  }

  // التحليلات Analytics
  try {
    if (firebase.analytics && window.location.protocol.startsWith('http')) {
      window.analytics = firebase.analytics();
    }
  } catch (e) {
    // Analytics requires http/https
  }

  console.log("🔥 [Firebase] ✅ تم الاتصال بنجاح بقاعدة بيانات دكتور محمد عبد الله:", firebaseConfig.projectId);
} else {
  console.warn("⚠️ [Firebase] لم يتم العثور على مكتبة Firebase SDK قبل تحميل firebase-config.js");
}
