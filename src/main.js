import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="glass-card">
    <h1>Hello World</h1>
    <p>Welcome to your new modern web application. Beautifully designed, lightning fast, and ready to go.</p>
    <button class="btn" id="actionBtn">Start Building</button>
  </div>
`;

document.querySelector('#actionBtn').addEventListener('click', (e) => {
  e.target.innerHTML = 'Let\'s go! 🚀';
  setTimeout(() => {
    e.target.innerHTML = 'Start Building';
  }, 2000);
});
