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
const foodInput = document.getElementById('foodInput');
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
        window.location.href = "index.html";
    }
});

// 2. Çıkış Yapma İşlemi
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

// 3. Yapay Zeka ile Yiyecek ve Kalori Ekleme
addBtn.addEventListener('click', async () => {
    const userInput = foodInput.value;

    if (userInput === "") {
        alert("Lütfen ne yediğini yaz!");
        return;
    }

    addBtn.innerText = "Yapay Zeka Hesaplarken Bekle... ⏳";
    addBtn.disabled = true;

    try {
        const prompt = `Kullanıcı şu yemeği yediğini söylüyor: "${userInput}". Bana sadece bu yemeğin temizlenmiş özet adını ve toplam kalorisini aralarında virgül olacak şekilde tek satırda dön. Örnek çıktı: 2 Lahmacun ve Ayran, 650. Sadece bu formatta cevap ver, asla başka kelime veya açıklama yazma.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text.trim();
        
        const [foodName, foodCalorieText] = aiResponse.split(',');
        const calories = Number(foodCalorieText);

        await addDoc(collection(db, "foods"), {
            uid: currentUser.uid,
            name: foodName.trim(),
            calories: calories,
            timestamp: new Date()
        });
        
        foodInput.value = "";
        addFoodToDOM(foodName.trim(), calories);

    } catch (e) {
        console.error("Yapay Zeka Hatası: ", e);
        alert("Kalori hesaplanırken bir sorun oluştu! Farklı bir şekilde yazmayı dene.");
    } finally {
        addBtn.innerText = "Yapay Zekaya Sor ve Ekle";
        addBtn.disabled = false;
    }
});

// 4. Veritabanından Kullanıcının Kendi Verilerini Çekme
async function loadFoods() {
    foodList.innerHTML = ""; 
    totalCals = 0; 
    
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
