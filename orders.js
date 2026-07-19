const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('#toast');
const cartCount = document.querySelector('#cart-count');
const orderItems = document.querySelector('#order-items');
const orderEmpty = document.querySelector('#order-empty');
const orderForm = document.querySelector('#order-form');
const placeOrderButton = document.querySelector('#place-order');
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

function saveCart() { localStorage.setItem('velora-order', JSON.stringify(cart)); }

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

function quantityButton(label, action, itemName) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = label; button.dataset.action = action; button.dataset.item = itemName;
  button.setAttribute('aria-label', `${action === 'increase' ? 'Increase' : 'Decrease'} ${itemName} quantity`);
  return button;
}

function orderItem(item) {
  const row = document.createElement('article');
  row.className = 'order-item';
  const image = document.createElement('img'); image.src = item.image; image.alt = ''; image.width = 96; image.height = 86;
  const copy = document.createElement('div'); copy.className = 'order-item-copy';
  const title = document.createElement('h3'); title.textContent = item.name;
  const unitPrice = document.createElement('p'); unitPrice.textContent = `${money.format(item.price)} each`;
  const quantity = document.createElement('div'); quantity.className = 'quantity-control';
  quantity.append(quantityButton('−', 'decrease', item.name));
  const count = document.createElement('span'); count.textContent = item.quantity;
  quantity.append(count, quantityButton('+', 'increase', item.name));
  copy.append(title, unitPrice, quantity);
  const total = document.createElement('div'); total.className = 'order-item-total';
  const price = document.createElement('strong'); price.textContent = money.format(item.price * item.quantity);
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = 'Remove'; remove.dataset.action = 'remove'; remove.dataset.item = item.name;
  total.append(price, remove); row.append(image, copy, total); return row;
}

function renderOrder() {
  const items = Object.values(cart).filter(item => Number(item.quantity) > 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 49;
  const service = subtotal === 0 ? 0 : 29;
  orderItems.replaceChildren(...items.map(orderItem));
  orderEmpty.classList.toggle('is-hidden', items.length > 0);
  document.querySelector('.add-more-link').classList.toggle('is-visible', items.length > 0);
  cartCount.textContent = itemCount;
  cartCount.closest('.mini-cart').setAttribute('aria-label', `View order, currently ${itemCount} item${itemCount === 1 ? '' : 's'}`);
  if (dockCount) dockCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'} added`;
  if (dockTotal) dockTotal.textContent = money.format(subtotal);
  document.querySelector('#order-subtotal').textContent = money.format(subtotal);
  document.querySelector('#order-delivery').textContent = delivery === 0 && subtotal > 0 ? 'Complimentary' : money.format(delivery);
  document.querySelector('#order-service').textContent = money.format(service);
  document.querySelector('#order-total').textContent = money.format(subtotal + delivery + service);
  document.querySelector('#delivery-note').textContent = subtotal >= 999 ? 'Complimentary delivery unlocked.' : `Add ${money.format(Math.max(0, 999 - subtotal))} more for free delivery.`;
  placeOrderButton.disabled = items.length === 0;
  saveCart();
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

orderItems.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = cart[button.dataset.item];
  if (!item) return;
  if (button.dataset.action === 'increase') item.quantity += 1;
  if (button.dataset.action === 'decrease') item.quantity -= 1;
  if (button.dataset.action === 'remove' || item.quantity <= 0) delete cart[item.name];
  renderOrder();
});

document.querySelector('#clear-order').addEventListener('click', () => {
  if (!Object.keys(cart).length) return;
  cart = {}; renderOrder(); showToast('Your order has been cleared');
});

orderForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!Object.keys(cart).length || !orderForm.reportValidity()) return;
  const customerName = new FormData(orderForm).get('name').trim();
  cart = {}; renderOrder(); orderForm.reset();
  showToast(`Thank you, ${customerName}. Your Velora order is confirmed.`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target);
}), { threshold: 0.08 });
document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();
renderOrder();
