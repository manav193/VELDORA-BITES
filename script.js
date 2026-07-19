const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('#toast');
const cartCount = document.querySelector('#cart-count');
const orderItems = document.querySelector('#order-items');
const orderEmpty = document.querySelector('#order-empty');
const orderForm = document.querySelector('#order-form');
const placeOrderButton = document.querySelector('#place-order');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('velora-order'));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

let cart = loadCart();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

function saveCart() {
  localStorage.setItem('velora-order', JSON.stringify(cart));
}

function createQuantityButton(label, action, itemName) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.item = itemName;
  button.setAttribute('aria-label', `${action === 'increase' ? 'Increase' : 'Decrease'} ${itemName} quantity`);
  return button;
}

function createOrderItem(item) {
  const row = document.createElement('article');
  row.className = 'order-item';

  const image = document.createElement('img');
  image.src = item.image;
  image.alt = '';
  image.width = 84;
  image.height = 76;

  const copy = document.createElement('div');
  copy.className = 'order-item-copy';
  const title = document.createElement('h4');
  title.textContent = item.name;
  const unitPrice = document.createElement('p');
  unitPrice.textContent = `${money.format(item.price)} each`;
  const quantity = document.createElement('div');
  quantity.className = 'quantity-control';
  quantity.append(createQuantityButton('−', 'decrease', item.name));
  const count = document.createElement('span');
  count.textContent = item.quantity;
  quantity.append(count, createQuantityButton('+', 'increase', item.name));
  copy.append(title, unitPrice, quantity);

  const total = document.createElement('div');
  total.className = 'order-item-total';
  const price = document.createElement('strong');
  price.textContent = money.format(item.price * item.quantity);
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-item';
  remove.textContent = 'Remove';
  remove.dataset.action = 'remove';
  remove.dataset.item = item.name;
  total.append(price, remove);

  row.append(image, copy, total);
  return row;
}

function renderOrder() {
  const items = Object.values(cart).filter(item => item.quantity > 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 60 ? 0 : 4.5;
  const service = subtotal === 0 ? 0 : 2.5;
  const total = subtotal + delivery + service;

  orderItems.replaceChildren(...items.map(createOrderItem));
  orderEmpty.classList.toggle('is-hidden', items.length > 0);
  cartCount.textContent = itemCount;
  cartCount.closest('.mini-cart').setAttribute('aria-label', `View order, currently ${itemCount} item${itemCount === 1 ? '' : 's'}`);
  document.querySelector('#order-subtotal').textContent = money.format(subtotal);
  document.querySelector('#order-delivery').textContent = delivery === 0 && subtotal > 0 ? 'Free' : money.format(delivery);
  document.querySelector('#order-service').textContent = money.format(service);
  document.querySelector('#order-total').textContent = money.format(total);
  document.querySelector('#delivery-note').textContent = subtotal >= 60
    ? 'Complimentary delivery unlocked.'
    : `Add ${money.format(Math.max(0, 60 - subtotal))} more for free delivery.`;
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

document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.dish-card');
    const name = button.dataset.item;
    const price = Number(button.dataset.price);
    const image = card.querySelector('img').src;
    const currentQuantity = cart[name]?.quantity || 0;
    cart[name] = { name, price, image, quantity: currentQuantity + 1 };
    renderOrder();
    button.textContent = 'Added';
    showToast(`${name} added to your order`);
    setTimeout(() => { button.textContent = 'Add'; }, 1200);
  });
});

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
  if (Object.keys(cart).length === 0) return;
  cart = {};
  renderOrder();
  showToast('Your order has been cleared');
});

document.querySelectorAll('.category-card').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.dish-card').forEach(card => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

orderForm.addEventListener('submit', event => {
  event.preventDefault();
  if (Object.keys(cart).length === 0) return;
  if (!orderForm.reportValidity()) return;
  const customerName = new FormData(orderForm).get('name').trim();
  cart = {};
  renderOrder();
  orderForm.reset();
  showToast(`Order confirmed for ${customerName}. We'll call you shortly.`);
});

document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get('email');
  showToast(`Welcome to Velora, ${email}`);
  event.currentTarget.reset();
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id], header[id]')];
const navLinks = [...mainNav.querySelectorAll('a')];
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -60% 0px' });

sections.forEach(section => navObserver.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();
renderOrder();
