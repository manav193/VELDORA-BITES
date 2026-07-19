const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('#toast');
const cartCount = document.querySelector('#cart-count');
const dishGrid = document.querySelector('#dish-grid');
const visibleCount = document.querySelector('#visible-count');
const dockCount = document.querySelector('#dock-count');
const dockTotal = document.querySelector('#dock-total');
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('velora-order'));
    if (!saved || typeof saved !== 'object') return {};
    Object.values(saved).forEach(item => {
      const currentDish = window.VELORA_MENU?.find(dish => dish.name === item.name);
      if (currentDish) item.price = currentDish.price;
    });
    return saved;
  } catch {
    return {};
  }
}

let cart = loadCart();

function saveCart() {
  localStorage.setItem('velora-order', JSON.stringify(cart));
}

function cartQuantity() {
  return Object.values(cart).reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function updateCartCount() {
  const quantity = cartQuantity();
  const subtotal = Object.values(cart).reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  cartCount.textContent = quantity;
  cartCount.closest('.mini-cart').setAttribute('aria-label', `View order, currently ${quantity} item${quantity === 1 ? '' : 's'}`);
  if (dockCount) dockCount.textContent = `${quantity} item${quantity === 1 ? '' : 's'} added`;
  if (dockTotal) dockTotal.textContent = money.format(subtotal);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

function dishCard(dish) {
  const article = document.createElement('article');
  article.className = 'dish-card';
  article.dataset.category = dish.category;
  article.dataset.reveal = '';
  article.innerHTML = `
    <div class="dish-art"><img src="${dish.image}" alt="${dish.alt}" width="900" height="600" loading="lazy" decoding="async"></div>
    <div class="dish-content">
      <p class="dish-label">${dish.label}</p>
      <h3>${dish.name}</h3>
      <p>${dish.description}</p>
      <div class="dish-meta"><strong>${money.format(dish.price)}</strong><span>${dish.rating.toFixed(1)} rating</span></div>
      <button class="add-button" type="button" data-item="${dish.name}">Add to order</button>
    </div>`;
  return article;
}

function renderMenu() {
  const dailySpecialNames = [
    'Truffle Risotto',
    'Delhi Papdi Chaat',
    'Royal Butter Chicken',
    'Velvet Tiramisu',
    'Rose & Lychee Fizz'
  ];
  const dishes = dishGrid.dataset.menuView === 'specials'
    ? dailySpecialNames.map(name => window.VELORA_MENU.find(dish => dish.name === name)).filter(Boolean)
    : window.VELORA_MENU;
  dishGrid.replaceChildren(...dishes.map(dishCard));
}

function filterMenu(filter) {
  let count = 0;
  document.querySelectorAll('.dish-card').forEach(card => {
    const hidden = filter !== 'all' && card.dataset.category !== filter;
    card.classList.toggle('is-hidden', hidden);
    if (!hidden) count += 1;
  });
  if (visibleCount) visibleCount.textContent = count;
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

renderMenu();
updateCartCount();

dishGrid.addEventListener('click', event => {
  const button = event.target.closest('.add-button');
  if (!button) return;
  const dish = window.VELORA_MENU.find(item => item.name === button.dataset.item);
  if (!dish) return;
  const currentQuantity = Number(cart[dish.name]?.quantity || 0);
  cart[dish.name] = { name: dish.name, price: dish.price, image: dish.image, quantity: currentQuantity + 1 };
  saveCart();
  updateCartCount();
  button.textContent = 'Added ✓';
  showToast(`${dish.name} added — open Orders when ready`);
  setTimeout(() => { button.textContent = 'Add to order'; }, 1200);
});

document.querySelectorAll('.category-card').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
    button.classList.add('active');
    filterMenu(button.dataset.filter);
  });
});

const newsletterForm = document.querySelector('#newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    showToast(`Welcome to Velora, ${email}`);
    event.currentTarget.reset();
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px' });

document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id], header[id]')];
const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -60% 0px' });

sections.forEach(section => navObserver.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
