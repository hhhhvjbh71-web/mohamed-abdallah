/**
 * خدمات مساعدة لـ Firebase (firebase-service.js)
 * توفر دوال مساعدة موحدة للمنصة ولوحة التحكم
 */

window.FirebaseService = {
  getDb: function() {
    if (window.db) return window.db;
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      window.db = firebase.firestore();
      return window.db;
    }
    return null;
  },

  getAuth: function() {
    if (window.auth) return window.auth;
    if (typeof firebase !== 'undefined' && firebase.auth) {
      window.auth = firebase.auth();
      return window.auth;
    }
    return null;
  },

  getConfig: function() {
    return typeof firebaseConfig !== 'undefined' ? firebaseConfig : null;
  }
};
