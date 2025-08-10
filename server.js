const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

let users = {}; // username -> {password, friends:[], posts:[], chats:{}}
let posts = []; // {username, text, time}

function ensureUser(username) {
  if (!users[username]) users[username] = {password:'', friends:[], posts:[], chats:{}};
}

// --- Registration ---
app.post('/register', (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) return res.status(400).json({error:'Missing fields'});
  if (users[username]) return res.status(400).json({error:'User exists'});
  users[username] = {password, friends:[], posts:[], chats:{}};
  res.json({ok:true});
});

// --- Login ---
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) return res.status(400).json({error:'Missing fields'});
  if (!users[username] || users[username].password!==password) return res.status(401).json({error:'Invalid credentials'});
  res.json({ok:true});
});

// --- Add Friend ---
app.post('/addFriend', (req, res) => {
  const {username, friend} = req.body;
  ensureUser(username); ensureUser(friend);
  if (!users[username].friends.includes(friend)) users[username].friends.push(friend);
  if (!users[friend].friends.includes(username)) users[friend].friends.push(username);
  res.json({ok:true});
});

// --- Post to Feed ---
app.post('/post', (req, res) => {
  const {username, text} = req.body;
  ensureUser(username);
  const post = {username, text, time:Date.now()};
  posts.push(post);
  users[username].posts.push(post);
  res.json({ok:true});
});

// --- Get Feed ---
app.get('/feed', (req, res) => {
  res.json(posts.slice(-100).reverse());
});

// --- Get Friends ---
app.get('/friends/:username', (req, res) => {
  ensureUser(req.params.username);
  res.json(users[req.params.username].friends);
});

// --- Chat ---
app.post('/chat', (req, res) => {
  const {from, to, text} = req.body;
  ensureUser(from); ensureUser(to);
  const msg = {from, to, text, time:Date.now()};
  if (!users[from].chats[to]) users[from].chats[to]=[];
  if (!users[to].chats[from]) users[to].chats[from]=[];
  users[from].chats[to].push(msg);
  users[to].chats[from].push(msg);
  res.json({ok:true});
});
app.get('/chat/:from/:to', (req, res) => {
  ensureUser(req.params.from); ensureUser(req.params.to);
  res.json(users[req.params.from].chats[req.params.to]||[]);
});

app.listen(PORT, ()=>console.log('Server running on '+PORT));
