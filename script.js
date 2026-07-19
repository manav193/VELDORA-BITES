const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('#toast');
const cartCount = document.querySelector('#cart-count');
let cartItems = 0;
let toastTimer;

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

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    cartItems += 1;
    cartCount.textContent = cartItems;
    cartCount.closest('.mini-cart').setAttribute('aria-label', `View order, currently ${cartItems} item${cartItems === 1 ? '' : 's'}`);
    button.textContent = 'Added';
    showToast(`${button.dataset.item} added to your order`);
    setTimeout(() => { button.textContent = 'Add'; }, 1200);
  });
});

document.querySelectorAll('.category-card').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.dish-card').forEach(card => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
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
