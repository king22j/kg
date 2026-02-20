import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
const GEMINI_API_KEY = "AIzaSyBz7C95mjwr3AoLREx4Ch06sVRE9cLTiYg";
// Senin Firebase ayarların
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
const db = getFirestore(app);

// HTML'deki yerleri seçiyoruz
const foodNameInput = document.getElementById('foodName');
const foodCalorieInput = document.getElementById('foodCalorie');
const addBtn = document.getElementById('addBtn');
const foodList = document.getElementById('foodList');
const totalCaloriesSpan = document.getElementById('totalCalories');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;
let totalCals = 0;

// 1. Kullanıcı giriş yapmış mı diye kontrol et
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadFoods(); // Giriş yaptıysa veritabanından yedikleri getir
    } else {
        // Giriş yapmamışsa (veya çıkış yaptıysa) gizlice bu sayfaya giremesin, ana sayfaya at
        window.location.href = "index.html";
    }
});

// 2. Çıkış Yapma İşlemi
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

// 3. Yeni Yiyecek ve Kalori Ekleme
addBtn.addEventListener('click', async () => {
    const name = foodNameInput.value;
    const calories = Number(foodCalorieInput.value);

    // Boş girilmesini engelle
    if (name === "" || calories <= 0) {
        alert("Lütfen geçerli bir yiyecek ve kalori girin!");
        return;
    }

    try {
        // Firebase Firestore'a kaydet
        await addDoc(collection(db, "foods"), {
            uid: currentUser.uid, // Hangi kullanıcı ekledi bilmemiz lazım
            name: name,
            calories: calories,
            timestamp: new Date()
        });
        
        // Kutucukları temizle ve ekrana yazdır
        foodNameInput.value = "";
        foodCalorieInput.value = "";
        addFoodToDOM(name, calories);
    } catch (e) {
        console.error("Hata oluştu: ", e);
    }
});

// 4. Veritabanından Kullanıcının Kendi Verilerini Çekme
async function loadFoods() {
    foodList.innerHTML = ""; // Önce listeyi temizle
    totalCals = 0; 
    
    // Sadece giriş yapan kullanıcının (uid) verilerini getir
    const q = query(collection(db, "foods"), where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        addFoodToDOM(data.name, data.calories);
    });
}

// 5. Ekrana Listeleme ve Toplam Kaloriyi Güncelleme
function addFoodToDOM(name, calories) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${name}</span> <span><strong>${calories}</strong> kcal</span>`;
    foodList.appendChild(li);

    totalCals += calories;
    totalCaloriesSpan.innerText = totalCals;
}
