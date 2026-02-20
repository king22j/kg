// Firebase modüllerini içe aktarıyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Senin Firebase yapılandırma ayarların
const firebaseConfig = {
  apiKey: "AIzaSyBNuu3I0mX8_Dj0ABOIKwissv7mNfNLUs0",
  authDomain: "kg-takip.firebaseapp.com",
  projectId: "kg-takip",
  storageBucket: "kg-takip.firebasestorage.app",
  messagingSenderId: "767852128828",
  appId: "1:767852128828:web:2f759b707489947db17139",
  measurementId: "G-R56TBWM7WR"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// HTML dosyamızdaki (index.html) butonları ve kutuları seçiyoruz
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const message = document.getElementById('authMessage');

// KAYIT OL İşlemi
registerBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Şifre en az 6 karakter olmalı (Firebase kuralı)
    if(password.length < 6) {
        message.innerText = "Şifre en az 6 karakter olmalıdır!";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            message.style.color = "green";
            message.innerText = "Kayıt başarılı! Sisteme giriyorsun...";
            // Başarılı olursa dashboard'a yönlendir
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
        })
        .catch((error) => {
            message.style.color = "red";
            message.innerText = "Kayıt hatası: E-posta formatını kontrol et veya şifreyi değiştir.";
        });
});

// GİRİŞ YAP İşlemi
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            message.style.color = "green";
            message.innerText = "Giriş başarılı! Yönlendiriliyorsunuz...";
            // Başarılı olursa dashboard'a yönlendir
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
        })
        .catch((error) => {
            message.style.color = "red";
            message.innerText = "Giriş başarısız: E-posta veya şifre hatalı!";
        });
});
