const ADMIN_PASSWORD = "junyung2010!";

// =========================
// 데이터 저장
// =========================
let geckos =
JSON.parse(
localStorage.getItem("geckos")
) || [];

let inquiries =
JSON.parse(
localStorage.getItem("inquiries")
) || [];

let logoUrl =
localStorage.getItem("logoUrl")
|| "https://i.imgur.com/2DhmtJ4.png";

function saveGeckos(){
  localStorage.setItem(
    "geckos",
    JSON.stringify(geckos)
  );
}

function saveInquiries(){
  localStorage.setItem(
    "inquiries",
    JSON.stringify(inquiries)
  );
}

function updateLogo(){
  document.getElementById(
    "mainLogo"
  ).src = logoUrl;
}

// =========================
// 이미지 base64 변환
// =========================
function fileToBase64(file){

  return new Promise((resolve)=>{

    const reader =
    new FileReader();

    reader.onload = ()=>
    resolve(reader.result);

    reader.readAsDataURL(file);
  });
}

// =========================
// 개체 렌더링
// =========================
function renderGeckos(){

  const grid =
  document.getElementById(
    "geckoGrid"
  );

  grid.innerHTML = "";

  geckos.forEach((gecko,index)=>{

    let slidesHTML =
    gecko.images.map(src=>
      `
      <img
      src="${src}"
      style="
      display:none;
      width:100%;
      height:auto;
      max-height:380px;
      object-fit:contain;
      ">
      `
    ).join("");

    const card =
    document.createElement("div");

    card.className = "card";

    card.innerHTML = `

    <div class="image-container"
    data-index="${index}">

      ${slidesHTML}

      ${
        gecko.images.length > 1
        ?
        `
        <button
        class="slide-btn prev"
        onclick="prevSlide(${index})">
        ←
        </button>

        <button
        class="slide-btn next"
        onclick="nextSlide(${index})">
        →
        </button>
        `
        :
        ""
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

      <p class="detail">
        💰 ${gecko.price}
      </p>

      <p class="detail">
        ⚖️ ${gecko.weight}
      </p>

      <p class="detail">
        📅 ${gecko.birth}
      </p>

      <p class="detail">
        🚹 ${gecko.gender}
      </p>

      <p class="detail">
        ${gecko.desc}
      </p>

      ${
        gecko.status === "sale"
        ?
        `
        <textarea
        id="message-${index}"
        placeholder="
문의 내용
(방문 희망일 등)
"></textarea>

        <button
        class="send"
        onclick="sendInquiry(${index})">
        문의 보내기
        </button>

        <button
        class="adopt-btn"
        onclick="
        showAdoptOptions(${index})
        ">
        🐾 입양하기
        </button>
        `
        :
        ""
      }

    </div>
    `;

    grid.appendChild(card);

    const firstImg =
    card.querySelector("img");

    if(firstImg){
      firstImg.style.display =
      "block";
    }
  });
}

// =========================
// 슬라이드
// =========================
let currentSlideIndex = {};

function prevSlide(i){

  const container =
  document.querySelector(
    `.image-container[data-index="${i}"]`
  );

  const imgs =
  container.querySelectorAll("img");

  currentSlideIndex[i] =
  (currentSlideIndex[i] || 0) - 1;

  if(currentSlideIndex[i] < 0){
    currentSlideIndex[i] =
    imgs.length - 1;
  }

  showSlide(
    container,
    currentSlideIndex[i]
  );
}

function nextSlide(i){

  const container =
  document.querySelector(
    `.image-container[data-index="${i}"]`
  );

  const imgs =
  container.querySelectorAll("img");

  currentSlideIndex[i] =
  (currentSlideIndex[i] || 0) + 1;

  if(currentSlideIndex[i]
  >= imgs.length){

    currentSlideIndex[i] = 0;
  }

  showSlide(
    container,
    currentSlideIndex[i]
  );
}

function showSlide(container,idx){

  container
  .querySelectorAll("img")
  .forEach((img,i)=>{

    img.style.display =
    i === idx
    ? "block"
    : "none";
  });
}

// =========================
// 문의 보내기
// =========================
function sendInquiry(index){

  const message =
  document.getElementById(
    `message-${index}`
  ).value;

  const phone =
  prompt(
    "전화번호를 입력해주세요."
  );

  if(!phone) return;

  inquiries.unshift({

    geckoName:
    geckos[index].name,

    message:
    message,

    phone:
    phone,

    type:
    "일반 문의",

    time:
    new Date()
    .toLocaleString("ko-KR")
  });

  saveInquiries();

  alert(
    "✅ 문의가 접수되었습니다!"
  );
}

// =========================
// 입양하기
// =========================
function showAdoptOptions(index){

  const geckoName =
  geckos[index].name;

  const choice =
  prompt(
`${geckoName}

1. 도도시 배송
2. 직접 방문

번호 입력`
  );

  if(choice === "1"){

    const phone =
    prompt(
"도도시 배송 신청\n\n전화번호 입력"
    );

    if(!phone) return;

    inquiries.unshift({

      geckoName:
      geckoName,

      phone:
      phone,

      type:
      "도도시 배송",

      time:
      new Date()
      .toLocaleString("ko-KR")
    });

    saveInquiries();

    alert(
      "✅ 도도시 배송 신청 완료!"
    );
  }

  else if(choice === "2"){

    const phone =
    prompt(
"직접 방문 신청\n\n전화번호 입력"
    );

    if(!phone) return;

    inquiries.unshift({

      geckoName:
      geckoName,

      phone:
      phone,

      type:
      "직접 방문",

      time:
      new Date()
      .toLocaleString("ko-KR")
    });

    saveInquiries();

    alert(
      "✅ 방문 신청 완료!"
    );
  }
}

// =========================
// 관리자 로그인
// =========================
function adminLogin(){

  const pw =
  prompt(
    "관리자 비밀번호 입력"
  );

  if(pw === ADMIN_PASSWORD){

    adminPanel();
  }

  else{

    alert(
      "비밀번호가 틀렸습니다."
    );
  }
}

// =========================
// 관리자 페이지
// =========================
function adminPanel(){

  let html = `
  <div style="
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:
  rgba(0,0,0,0.95);
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

  <button onclick="
  changeLogo()
  ">
  로고 변경
  </button>

  <button onclick="
  addGecko()
  ">
  새 개체 등록
  </button>

  <button onclick="
  location.reload()
  ">
  닫기
  </button>

  <div id="adminList"
  style="margin-top:30px;">
  </div>

  </div>
  </div>
  `;

  const div =
  document.createElement("div");

  div.innerHTML = html;

  document.body.appendChild(div);

  renderAdminList();
}

// =========================
// 관리자 목록
// =========================
function renderAdminList(){

  const container =
  document.getElementById(
    "adminList"
  );

  let html =
  "<h3>등록된 개체</h3>";

  geckos.forEach((g,i)=>{

    html += `
    <div style="
    border:1px solid #ddd;
    padding:15px;
    margin-bottom:15px;
    border-radius:12px;
    ">

    <strong>${g.name}</strong>

    <br><br>

    <button onclick="
    toggleStatus(${i})
    ">

    ${
      g.status === "sale"
      ?
      "🟢 분양중 → ⚫ 분양완료"
      :
      "⚫ 분양완료 → 🟢 분양중"
    }

    </button>

    <button onclick="
    deleteGecko(${i})
    ">
    삭제
    </button>

    </div>
    `;
  });

  html += `
  <h3 style="
  margin-top:40px;
  ">
  📩 문의 / 입양 신청
  </h3>
  `;

  inquiries.forEach(q=>{

    html += `
    <div style="
    border:1px solid #ddd;
    padding:15px;
    margin-bottom:15px;
    border-radius:12px;
    background:#f9f9f9;
    ">

    <strong>
    ${q.geckoName}
    </strong>

    <br><br>

    📦 ${q.type}<br>
    📱 ${q.phone}<br>

    ${
      q.message
      ?
      `💬 ${q.message}<br>`
      :
      ""
    }

    <small>
    ${q.time}
    </small>

    </div>
    `;
  });

  container.innerHTML = html;
}

// =========================
// 상태 변경
// =========================
function toggleStatus(i){

  geckos[i].status =
  geckos[i].status === "sale"
  ? "sold"
  : "sale";

  saveGeckos();

  renderGeckos();

  renderAdminList();
}

// =========================
// 개체 추가
// =========================
async function addGecko(){

  const name =
  prompt("개체 이름");

  if(!name) return;

  const input =
  document.createElement("input");

  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange =
  async ()=>{

    const images = [];

    for(let file of input.files){

      images.push(
        await fileToBase64(file)
      );
    }

    const newGecko = {

      id: Date.now(),

      name: name,

      price:
      prompt("가격")
      || "35만원",

      weight:
      prompt("무게")
      || "18g",

      birth:
      prompt("생년월일")
      || "2025-01-01",

      gender:
      prompt("성별")
      || "수컷",

      status:
      "sale",

      images:
      images.length > 0
      ? images
      :
      [
      "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?q=80&w=1200"
      ],

      desc:
      prompt("설명")
      || "입문자 추천 건강한 개체"
    };

    geckos.unshift(
      newGecko
    );

    saveGeckos();

    renderGeckos();

    alert(
      "✅ 개체 등록 완료!"
    );
  };

  input.click();
}

// =========================
// 개체 삭제
// =========================
function deleteGecko(i){

  if(confirm(
    "삭제하시겠습니까?"
  )){

    geckos.splice(i,1);

    saveGeckos();

    renderGeckos();

    renderAdminList();
  }
}

// =========================
// 로고 변경
// =========================
async function changeLogo(){

  const input =
  document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.onchange =
  async ()=>{

    if(input.files[0]){

      logoUrl =
      await fileToBase64(
        input.files[0]
      );

      localStorage.setItem(
        "logoUrl",
        logoUrl
      );

      updateLogo();

      alert(
        "✅ 로고 변경 완료!"
      );
    }
  };

  input.click();
}

// =========================
// 초기 실행
// =========================
updateLogo();
renderGeckos();
