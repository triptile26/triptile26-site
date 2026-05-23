const ADMIN_PASSWORD = "junyung2010!";

let geckos = JSON.parse(localStorage.getItem("geckos")) || [];

let inquiries =
JSON.parse(localStorage.getItem("inquiries")) || [];

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
  document.getElementById("mainLogo").src =
  logoUrl;
}

function fileToBase64(file){

  return new Promise((resolve)=>{

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e)=>{
      img.src = e.target.result;
    };

    img.onload = ()=>{

      const canvas =
      document.createElement("canvas");

      const MAX_WIDTH = 900;

      let width = img.width;
      let height = img.height;

      if(width > MAX_WIDTH){
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx =
      canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      const compressed =
      canvas.toDataURL(
        "image/jpeg",
        0.7
      );

      resolve(compressed);
    };

    reader.readAsDataURL(file);

  });
}

function renderGeckos(){

  const grid =
  document.getElementById("geckoGrid");

  grid.innerHTML = "";

  geckos.forEach((gecko,index)=>{

    let slidesHTML =
    gecko.images.map(src=>
      `<img src="${src}">`
    ).join("");

    const card =
    document.createElement("div");

    card.className = "card";

    card.innerHTML = `

      <div class="image-container"
           data-index="${index}">

        ${slidesHTML}

        ${
          gecko.images.length > 1 ?

          `
          <button class="slide-btn prev"
            onclick="prevSlide(${index})">
            ←
          </button>

          <button class="slide-btn next"
            onclick="nextSlide(${index})">
            →
          </button>
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
            id="msg-${index}"
            placeholder="문의 내용">
          </textarea>

          <button class="send"
            onclick="sendInquiry(
              '${gecko.name}',
              ${index}
            )">

            문의 보내기

          </button>

          <button class="adopt-btn"
            onclick="showAdoptOptions(
              ${index}
            )">

            🐾 입양하기

          </button>
          `
          : ""
        }

      </div>
    `;

    grid.appendChild(card);

    const firstImg =
    card.querySelector("img");

    if(firstImg){
      firstImg.style.display = "block";
    }

  });
}

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

function sendInquiry(name,index){

  const message =
  document.getElementById(
    `msg-${index}`
  ).value;

  if(!message.trim()){
    alert("문의 내용을 입력해주세요.");
    return;
  }

  inquiries.unshift({
    type:"문의",
    geckoName:name,
    message:message,
    time:new Date()
    .toLocaleString("ko-KR")
  });

  saveInquiries();

  alert("문의 접수 완료!");

  document.getElementById(
    `msg-${index}`
  ).value = "";
}

function showAdoptOptions(index){

  const choice = prompt(
`1. 도도시 배송
2. 직접 방문

번호 입력`
  );

  if(choice === "1"){
    adoptDodo(index);
  }

  if(choice === "2"){
    adoptVisit(index);
  }
}

function adoptDodo(index){

  const phone = prompt(
    "전화번호 입력"
  );

  if(phone){

    inquiries.unshift({
      type:"도도시 배송",
      geckoName:
      geckos[index].name,
      phone:phone,
      time:new Date()
      .toLocaleString("ko-KR")
    });

    saveInquiries();

    alert("배송 신청 완료!");
  }
}

function adoptVisit(index){

  const phone = prompt(
    "전화번호 입력"
  );

  if(phone){

    inquiries.unshift({
      type:"직접 방문",
      geckoName:
      geckos[index].name,
      phone:phone,
      time:new Date()
      .toLocaleString("ko-KR")
    });

    saveInquiries();

    alert("방문 신청 완료!");
  }
}

function adminLogin(){

  const pw = prompt(
    "관리자 비밀번호"
  );

  if(pw === ADMIN_PASSWORD){
    adminPanel();
  }

  else{
    alert("비밀번호 틀림");
  }
}

function adminPanel(){

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
        로고 변경
      </button>

      <button onclick="addGecko()">
        새 개체 등록
      </button>

      <button onclick="closeAdmin()">
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

function closeAdmin(){

  const overlay =
  document.getElementById(
    "adminOverlay"
  );

  if(overlay){
    overlay.remove();
  }
}

function renderAdminList(){

  const container =
  document.getElementById(
    "adminList"
  );

  let html = "";

  geckos.forEach((g,i)=>{

    html += `
    <div style="
      border:1px solid #ddd;
      padding:15px;
      margin-bottom:10px;
      border-radius:12px;
    ">

      <strong>${g.name}</strong>

      <br><br>

      <button onclick="
        toggleStatus(${i})
      ">
        상태 변경
      </button>

      <button onclick="
        deleteGecko(${i})
      ">
        삭제
      </button>

    </div>
    `;
  });

  container.innerHTML = html;
}

function toggleStatus(i){

  geckos[i].status =
  geckos[i].status === "sale"
  ? "sold"
  : "sale";

  saveGeckos();

  renderGeckos();

  renderAdminList();
}

async function addGecko(){

  const name = prompt("개체 이름");

  if(!name) return;

  const input =
  document.createElement("input");

  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange = async ()=>{

    const images = [];

    for(let file of input.files){

      const compressed =
      await fileToBase64(file);

      images.push(compressed);
    }

    const newGecko = {

      id:Date.now(),

      name:name,

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

      status:"sale",

      images:images,

      desc:
      prompt("설명")
      || "건강한 개체"
    };

    geckos.unshift(newGecko);

    saveGeckos();

    renderGeckos();

    alert("개체 등록 완료!");
  };

  input.click();
}

function deleteGecko(i){

  if(confirm("삭제하시겠습니까?")){

    geckos.splice(i,1);

    saveGeckos();

    renderGeckos();

    renderAdminList();
  }
}

async function changeLogo(){

  const input =
  document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = async ()=>{

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

      alert("로고 변경 완료");
    }
  };

  input.click();
}

updateLogo();
renderGeckos();
