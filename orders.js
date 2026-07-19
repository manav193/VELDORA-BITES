const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('#toast');
const cartCount = document.querySelector('#cart-count');
const orderItems = document.querySelector('#order-items');
const orderEmpty = document.querySelector('#order-empty');
const orderForm = document.querySelector('#order-form');
const placeOrderButton = document.querySelector('#place-order');
const upiField = document.querySelector('#upi-field');
const upiInput = upiField.querySelector('input');
const confirmationDialog = document.querySelector('#confirmation-dialog');
const recentOrderSection = document.querySelector('#recent-order');
const couponInput = document.querySelector('#coupon-code');
const couponMessage = document.querySelector('#coupon-message');
const removeCouponButton = document.querySelector('#remove-coupon');
const couponDiscountRow = document.querySelector('#coupon-discount-row');
const paymentDiscountRow = document.querySelector('#payment-discount-row');
const paymentOfferNote = document.querySelector('#payment-offer-note');
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
let activeCoupon = localStorage.getItem('velora-coupon') || '';

const couponRules = {
  VELORA15: { minimum: 599, label: '15% off up to ₹150', discount: subtotal => Math.min(150, Math.round(subtotal * 0.15)) },
  WELCOME100: { minimum: 499, label: '₹100 off', discount: () => 100 },
  CHAAT50: { minimum: 299, label: '₹50 off', discount: () => 50 }
};
if (!couponRules[activeCoupon]) activeCoupon = '';

function saveCart() { localStorage.setItem('velora-order', JSON.stringify(cart)); }

function currentPaymentMethod() {
  return orderForm.querySelector('input[name="payment"]:checked')?.value || 'UPI';
}

function couponSaving(subtotal) {
  const rule = couponRules[activeCoupon];
  if (!rule || subtotal < rule.minimum) return 0;
  return Math.min(subtotal, rule.discount(subtotal));
}

function paymentSaving(subtotal, couponDiscount, paymentMethod) {
  const eligibleAmount = Math.max(0, subtotal - couponDiscount);
  if (paymentMethod === 'UPI' && subtotal >= 499) return Math.min(75, Math.round(eligibleAmount * 0.05));
  if (paymentMethod === 'Card on delivery' && subtotal >= 799) return Math.min(120, Math.round(eligibleAmount * 0.10));
  return 0;
}

function renderOfferState(subtotal, couponDiscount, paymentDiscount, paymentMethod) {
  const rule = couponRules[activeCoupon];
  couponInput.value = activeCoupon;
  removeCouponButton.hidden = !activeCoupon;
  if (!activeCoupon) couponMessage.textContent = 'Choose an offer above or enter a code.';
  else if (couponDiscount > 0) couponMessage.textContent = `${activeCoupon} applied · you save ${money.format(couponDiscount)}.`;
  else couponMessage.textContent = `Add ${money.format(Math.max(0, rule.minimum - subtotal))} more to unlock ${activeCoupon}.`;
  couponDiscountRow.hidden = couponDiscount === 0;
  paymentDiscountRow.hidden = paymentDiscount === 0;
  document.querySelector('#coupon-discount').textContent = `−${money.format(couponDiscount)}`;
  document.querySelector('#payment-discount').textContent = `−${money.format(paymentDiscount)}`;
  if (paymentDiscount > 0) paymentOfferNote.textContent = `${paymentMethod} offer applied automatically: saving ${money.format(paymentDiscount)}.`;
  else if (paymentMethod === 'UPI') paymentOfferNote.textContent = `UPI offer unlocks at ${money.format(499)}.`;
  else if (paymentMethod === 'Card on delivery') paymentOfferNote.textContent = `Card offer unlocks at ${money.format(799)}.`;
  else paymentOfferNote.textContent = 'Coupon savings still apply with cash on delivery.';
}

function applyCoupon(code) {
  const normalizedCode = code.trim().toUpperCase();
  const rule = couponRules[normalizedCode];
  const subtotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!rule) {
    couponMessage.textContent = 'That coupon is not available. Try one of the offers above.';
    couponInput.value = normalizedCode;
    return;
  }
  if (subtotal < rule.minimum) {
    couponMessage.textContent = `Add ${money.format(rule.minimum - subtotal)} more to unlock ${normalizedCode}.`;
    couponInput.value = normalizedCode;
    return;
  }
  activeCoupon = normalizedCode;
  localStorage.setItem('velora-coupon', activeCoupon);
  renderOrder();
  showToast(`${activeCoupon} applied to your order`);
}

function calculateTotals() {
  const items = Object.values(cart).filter(item => Number(item.quantity) > 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 49;
  const service = subtotal === 0 ? 0 : 29;
  const paymentMethod = currentPaymentMethod();
  const couponDiscount = couponSaving(subtotal);
  const paymentDiscount = paymentSaving(subtotal, couponDiscount, paymentMethod);
  const total = Math.max(0, subtotal + delivery + service - couponDiscount - paymentDiscount);
  return { items, itemCount, subtotal, delivery, service, couponDiscount, paymentDiscount, paymentMethod, total };
}

function createOrderReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-4).toUpperCase().padStart(4, '0');
  return `VB-${date}-${suffix}`;
}

function renderRecentOrder() {
  try {
    const order = JSON.parse(localStorage.getItem('velora-last-order'));
    if (!order) return;
    recentOrderSection.hidden = false;
    document.querySelector('#recent-order-id').textContent = order.id;
    document.querySelector('#recent-order-total').textContent = money.format(order.total);
    const saving = order.savings ? ` · saved ${money.format(order.savings)}` : '';
    document.querySelector('#recent-order-detail').textContent = `${order.itemCount} item${order.itemCount === 1 ? '' : 's'} · ${order.payment} · ${order.time}${saving}`;
  } catch {
    recentOrderSection.hidden = true;
  }
}

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
  const { items, itemCount, subtotal, delivery, service, couponDiscount, paymentDiscount, paymentMethod, total } = calculateTotals();
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
  document.querySelector('#order-total').textContent = money.format(total);
  renderOfferState(subtotal, couponDiscount, paymentDiscount, paymentMethod);
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
  cart = {}; activeCoupon = ''; localStorage.removeItem('velora-coupon'); renderOrder(); showToast('Your order has been cleared');
});

document.querySelector('#apply-coupon').addEventListener('click', () => applyCoupon(couponInput.value));
couponInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  applyCoupon(couponInput.value);
});
document.querySelectorAll('[data-coupon]').forEach(button => button.addEventListener('click', () => applyCoupon(button.dataset.coupon)));
removeCouponButton.addEventListener('click', () => {
  activeCoupon = ''; localStorage.removeItem('velora-coupon'); renderOrder(); showToast('Coupon removed');
});

orderForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!Object.keys(cart).length || !orderForm.reportValidity()) return;
  const formData = new FormData(orderForm);
  const customerName = formData.get('name').trim();
  const totals = calculateTotals();
  const order = {
    id: createOrderReference(), customerName, payment: formData.get('payment'),
    time: formData.get('time'), itemCount: totals.itemCount, total: totals.total,
    coupon: activeCoupon || null, savings: totals.couponDiscount + totals.paymentDiscount,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('velora-last-order', JSON.stringify(order));
  cart = {}; activeCoupon = ''; localStorage.removeItem('velora-coupon'); orderForm.reset(); renderOrder();
  upiInput.required = true; upiField.hidden = false;
  document.querySelector('#confirmation-id').textContent = order.id;
  const savingCopy = order.savings ? ` You saved ${money.format(order.savings)} with today's offers.` : '';
  document.querySelector('#confirmation-copy').textContent = `${customerName}, your ${money.format(order.total)} order for ${order.time.toLowerCase()} is confirmed via ${order.payment}.${savingCopy}`;
  renderRecentOrder();
  if (typeof confirmationDialog.showModal === 'function') confirmationDialog.showModal();
  else showToast(`Order ${order.id} confirmed for ${customerName}.`);
});

orderForm.addEventListener('change', event => {
  if (event.target.name !== 'payment') return;
  const usesUpi = event.target.value === 'UPI';
  upiField.hidden = !usesUpi;
  upiInput.required = usesUpi;
  if (!usesUpi) upiInput.value = '';
  renderOrder();
});

confirmationDialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => confirmationDialog.close()));
confirmationDialog.addEventListener('click', event => {
  if (event.target === confirmationDialog) confirmationDialog.close();
});

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target);
}), { threshold: 0.08 });
document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();
renderOrder();
renderRecentOrder();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
