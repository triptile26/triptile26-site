// ================= Firebase 연결 =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// 🔥 니 Firebase SDK 값 넣기
const firebaseConfig = {
  apiKey: "여기에 apiKey",
  authDomain: "triptile.firebaseapp.com",
  databaseURL: "https://triptile-default-rtdb.firebaseio.com/",
  projectId: "triptile",
  storageBucket: "triptile.appspot.com",
  messagingSenderId: "여기에 senderId",
  appId: "여기에 appId"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= 기본 설정 =================
const ADMIN_PASSWORD = "junyung2010!";

let geckos = [];
let inquiries = [];

let logoUrl =
  "https://i.imgur.com/2DhmtJ4.png";

// ================= 저장 =================
function updateLogo() {
  document.getElementById("mainLogo").src = logoUrl;
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.readAsDataURL(file);
  });
}

// ================= 개체 렌더링 =================
function renderGeckos() {
  const grid = document.getElementById("geckoGrid");

  grid.innerHTML = "";

  geckos.forEach((gecko, index) => {
    let slidesHTML = gecko.images
      .map(
        (src) =>
          `<img src="${src}" style="display:none;width:100%;height:auto;max-height:380px;object-fit:contain;">`
      )
      .join("");

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <div class="image-container" data-index="${index}">
        ${slidesHTML}

        ${
          gecko.images.length > 1
            ? `
          <button class="slide-btn prev" onclick="prevSlide(${index})">←</button>
          <button class="slide-btn next" onclick="nextSlide(${index})">→</button>
        `
            : ""
        }
      </div>

      <div class="card-content">
        <span class="status ${gecko.status}">
          ${
            gecko.status === "sale"
              ? "🟢 분양중"
              : "⚫ 분양완료"
          }
        </span>

        <h3>${gecko.name}</h3>

        <p class="detail">💰 ${gecko.price}</p>
        <p class="detail">⚖️ ${gecko.weight}</p>
        <p class="detail">📅 ${gecko.birth}</p>
        <p class="detail">🚹 ${gecko.gender}</p>
        <p class="detail">${gecko.desc}</p>

        ${
          gecko.status === "sale"
            ? `
          <textarea id="msg-${index}" placeholder="문의 내용"></textarea>

          <button class="send" onclick="sendInquiry(${index})">
            문의 보내기
          </button>

          <button class="adopt-btn" onclick="showAdoptOptions(${index})">
            🐾 입양하기
          </button>
        `
            : ""
        }
      </div>
    `;

    grid.appendChild(card);

    const firstImg = card.querySelector("img");

    if (firstImg) firstImg.style.display = "block";
  });
}

// ================= 슬라이드 =================
let currentSlideIndex = {};

function prevSlide(i) {
  const container = document.querySelector(
    `.image-container[data-index="${i}"]`
  );

  const imgs = container.querySelectorAll("img");

  currentSlideIndex[i] =
    (currentSlideIndex[i] || 0) - 1;

  if (currentSlideIndex[i] < 0)
    currentSlideIndex[i] = imgs.length - 1;

  showSlide(container, currentSlideIndex[i]);
}

function nextSlide(i) {
  const container = document.querySelector(
    `.image-container[data-index="${i}"]`
  );

  const imgs = container.querySelectorAll("img");

  currentSlideIndex[i] =
    (currentSlideIndex[i] || 0) + 1;

  if (currentSlideIndex[i] >= imgs.length)
    currentSlideIndex[i] = 0;

  showSlide(container, currentSlideIndex[i]);
}

function showSlide(container, idx) {
  container
    .querySelectorAll("img")
    .forEach((img, i) => {
      img.style.display =
        i === idx ? "block" : "none";
    });
}

// ================= 문의 =================
function sendInquiry(index) {
  const gecko = geckos[index];

  const msg = document.getElementById(
    `msg-${index}`
  ).value;

  if (!msg) {
    alert("문의 내용을 입력해주세요.");
    return;
  }

  push(ref(db, "inquiries"), {
    type: "일반 문의",
    geckoName: gecko.name,
    message: msg,
    time: new Date().toLocaleString("ko-KR")
  });

  alert("문의가 전송되었습니다.");
}

// ================= 입양하기 =================
function showAdoptOptions(index) {
  const geckoName = geckos[index].name;

  const choice = prompt(
`${geckoName}

1. 도도시 배송
2. 직거래

번호 입력`
  );

  if (choice === "1") {
    adoptDodo(index);
  } else if (choice === "2") {
    adoptVisit(index);
  }
}

function adoptDodo(index) {
  const phone = prompt(
`도도시 배송 신청

전화번호 입력`
  );

  if (!phone) return;

  push(ref(db, "inquiries"), {
    type: "도도시 배송",
    geckoName: geckos[index].name,
    phone: phone,
    time: new Date().toLocaleString("ko-KR")
  });

  alert("도도시 배송 신청 완료!");
}

function adoptVisit(index) {
  const phone = prompt(
`직거래 신청

전화번호 입력`
  );

  if (!phone) return;

  push(ref(db, "inquiries"), {
    type: "직거래",
    geckoName: geckos[index].name,
    phone: phone,
    time: new Date().toLocaleString("ko-KR")
  });

  alert("직거래 신청 완료!");
}

// ================= 관리자 =================
function adminLogin() {
  const pw = prompt("관리자 비밀번호");

  if (pw === ADMIN_PASSWORD) {
    adminPanel();
  } else {
    alert("비밀번호 틀림");
  }
}

function adminPanel() {
  let html = `
  <div id="adminOverlay"
    style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.95);
      z-index:9999;
      overflow:auto;
      padding:20px;
    ">

    <div style="
      max-width:900px;
      margin:auto;
      background:white;
      padding:30px;
      border-radius:20px;
    ">

      <h2>관리자 페이지</h2>

      <button onclick="changeLogo()">
        프로필 변경
      </button>

      <button onclick="addGecko()">
        새 개체 등록
      </button>

      <button onclick="
        document.getElementById('adminOverlay').remove()
      ">
        닫기
      </button>

      <div id="adminList"></div>
    </div>
  </div>
  `;

  const div = document.createElement("div");

  div.innerHTML = html;

  document.body.appendChild(div);

  renderAdminList();
}

function renderAdminList() {
  const container =
    document.getElementById("adminList");

  let html = `<h3>등록 개체</h3>`;

  geckos.forEach((g) => {
    html += `
      <div style="
        border:1px solid #ddd;
        padding:15px;
        margin-bottom:15px;
        border-radius:12px;
      ">

        <strong>${g.name}</strong><br>

        <button onclick="toggleStatus('${g.firebaseKey}','${g.status}')">
          ${
            g.status === "sale"
              ? "🟢 분양중 → 완료"
              : "⚫ 완료 → 분양중"
          }
        </button>

        <button onclick="deleteGecko('${g.firebaseKey}')">
          삭제
        </button>
      </div>
    `;
  });

  html += `<h3>문의 내역</h3>`;

  inquiries.forEach((q) => {
    html += `
      <div style="
        border:1px solid #ddd;
        padding:12px;
        margin-bottom:10px;
        border-radius:12px;
      ">
        <strong>${q.geckoName}</strong><br>
        ${q.type}<br>

        ${
          q.phone
            ? `📞 ${q.phone}<br>`
            : ""
        }

        ${
          q.message
            ? `💬 ${q.message}<br>`
            : ""
        }

        <small>${q.time}</small>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ================= 상태 변경 =================
function toggleStatus(key, currentStatus) {
  update(ref(db, "geckos/" + key), {
    status:
      currentStatus === "sale"
        ? "sold"
        : "sale"
  });
}

// ================= 개체 등록 =================
async function addGecko() {
  const name = prompt("개체 이름");

  if (!name) return;

  const input =
    document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.multiple = true;

  input.onchange = async () => {
    const images = [];

    for (let file of input.files) {
      images.push(await fileToBase64(file));
    }

    const newGecko = {
      name: name,
      price: prompt("가격") || "35만원",
      weight: prompt("무게") || "18g",
      birth: prompt("생년월일") || "2025-01-01",
      gender: prompt("성별") || "수컷",
      status: "sale",
      images:
        images.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?q=80&w=1200"
            ],
      desc:
        prompt("설명") ||
        "입문자 추천 건강한 개체"
    };

    push(ref(db, "geckos"), newGecko);

    alert("개체 등록 완료!");
  };

  input.click();
}

// ================= 삭제 =================
function deleteGecko(key) {
  if (!confirm("삭제할까요?")) return;

  remove(ref(db, "geckos/" + key));
}

// ================= 프로필 변경 =================
async function changeLogo() {
  const input =
    document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.onchange = async () => {
    if (input.files[0]) {

      const base64 = await fileToBase64(
        input.files[0]
      );

      await update(ref(db), {
        logoUrl: base64
      });

      alert("프로필 변경 완료");
    }
  };

  input.click();
}

// ================= 실시간 불러오기 =================
onValue(ref(db, "geckos"), (snapshot) => {
  geckos = [];

  snapshot.forEach((child) => {
    geckos.unshift({
      firebaseKey: child.key,
      ...child.val()
    });
  });

  renderGeckos();
});

onValue(ref(db, "inquiries"), (snapshot) => {
  inquiries = [];

  snapshot.forEach((child) => {
    inquiries.unshift(child.val());
  });
});

// ================= 프로필 실시간 =================
onValue(ref(db, "logoUrl"), (snapshot) => {
  if (snapshot.exists()) {
    logoUrl = snapshot.val();
    updateLogo();
  }
});

// ================= 시작 =================
updateLogo();
