let myUser = "";
let friends = [];
let selectedFriend = null;

// --- Auth ---
function showMsg(msg) {
  document.getElementById('authMsg').textContent = msg;
}
document.getElementById('loginBtn').onclick = async ()=>{
  let u = document.getElementById('loginUser').value.trim();
  let p = document.getElementById('loginPass').value.trim();
  if(!u||!p) return showMsg("Fill out both fields");
  let res = await fetch('/login',{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  let data = await res.json();
  if(data.ok){
    myUser=u;
    document.getElementById('auth').style.display="none";
    document.getElementById('main').style.display="flex";
    document.getElementById('profileName').textContent=myUser;
    loadFriends();
    loadFeed();
  } else showMsg(data.error||"Login failed");
};
document.getElementById('regBtn').onclick = async ()=>{
  let u = document.getElementById('loginUser').value.trim();
  let p = document.getElementById('loginPass').value.trim();
  if(!u||!p) return showMsg("Fill out both fields");
  let res = await fetch('/register',{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  let data = await res.json();
  if(data.ok){
    showMsg("Registered! Now log in.");
  } else showMsg(data.error||"Registration failed");
};

// --- Friends ---
async function loadFriends() {
  let res = await fetch('/friends/'+myUser);
  friends = await res.json();
  renderFriends();
}
function renderFriends() {
  let html="";
  for(let f of friends){
    html+=`<div class="friendItem${selectedFriend===f?" selected":""}" data-friend="${f}">${f}</div>`;
  }
  document.getElementById('friends').innerHTML=html;
  document.querySelectorAll('.friendItem').forEach(item=>{
    item.onclick = ()=>{
      selectedFriend = item.getAttribute('data-friend');
      renderFriends();
      showChat(selectedFriend);
    };
  });
}
document.getElementById('addFriendBtn').onclick = async ()=>{
  let f = document.getElementById('addFriendInput').value.trim();
  if(!f||f===myUser) return;
  if(friends.includes(f)) return showMsg("Already friends");
  let res = await fetch('/addFriend',{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({username:myUser,friend:f})});
  let data = await res.json();
  if(data.ok) {
    loadFriends();
    document.getElementById('addFriendInput').value="";
  } else showMsg(data.error||"Error adding friend");
};

// --- Feed ---
async function loadFeed() {
  let res = await fetch('/feed');
  let posts = await res.json();
  renderFeed(posts);
}
function renderFeed(posts) {
  let html="";
  for(let p of posts){
    html+=`<div class="post">
      <div><b>${p.username}</b>: ${p.text.replace(/</g,"&lt;")}</div>
      <div class="meta">${new Date(p.time).toLocaleString()}</div>
    </div>`;
  }
  document.getElementById('feed').innerHTML = html || "<i>No posts yet!</i>";
}
document.getElementById('postForm').onsubmit = async e=>{
  e.preventDefault();
  let txt = document.getElementById('postText').value.trim();
  if(!txt) return;
  let res = await fetch('/post',{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({username:myUser,text:txt})});
  let data = await res.json();
  if(data.ok) {
    document.getElementById('postText').value="";
    loadFeed();
  }
};

// --- Chat ---
function showChat(friend) {
  document.getElementById('chatWrap').style.display="block";
  document.getElementById('chatTitle').textContent = "Chat with "+friend;
  loadChat(friend);
}
function hideChat() {
  document.getElementById('chatWrap').style.display="none";
  selectedFriend=null;
}
async function loadChat(friend) {
  let res = await fetch(`/chat/${myUser}/${friend}`);
  let msgs = await res.json();
  let html="";
  for(let msg of msgs){
    html+=`<div class="chatMsg${msg.from===myUser?" me":""}">
      <div>${msg.text.replace(/</g,"&lt;")}</div>
      <div class="meta">${msg.from} • ${new Date(msg.time).toLocaleTimeString()}</div>
    </div>`;
  }
  document.getElementById('chatMsgs').innerHTML=html;
}
document.getElementById('chatSendBtn').onclick = async ()=>{
  let friend = selectedFriend;
  let txt = document.getElementById('chatInput').value.trim();
  if(!txt) return;
  let res = await fetch('/chat',{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({from:myUser,to:friend,text:txt})});
  let data = await res.json();
  if(data.ok) {
    document.getElementById('chatInput').value="";
    loadChat(friend);
  }
};
document.getElementById('chatInput').addEventListener('keydown',e=>{
  if(e.key==="Enter") {
    e.preventDefault();
    document.getElementById('chatSendBtn').click();
  }
});
