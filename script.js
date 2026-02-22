// 1. Slider Functionality (Auto-slide & Pagination)
const slider = document.getElementById("slider");
const dots = Array.from(document.querySelectorAll(".slider-dot"));
const count = document.getElementById("slide-count");
let currentIndex = 0;
const totalSlides = slider ? slider.children.length : Math.max(1, dots.length);

function moveSlider(index) {
  if (!slider) return;
  currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
  // ensure smooth transition
  slider.style.transition = 'transform 0.9s cubic-bezier(0.23, 1, 0.32, 1)';
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  // Update Counter (1/2, 2/2)
  if (count) count.innerText = (currentIndex + 1);

  // Update Dots active state only if dots exist
  if (dots.length) {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active-dot", i === currentIndex);
      dot.classList.toggle("opacity-50", i !== currentIndex);
    });
  }
}

// Auto Slide every 5 seconds (only if more than one slide)
let autoSlide = null;
if (totalSlides > 1) {
  autoSlide = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    moveSlider(currentIndex);
  }, 5000);
}

// Manual Dot Click (stop auto-slide on manual interaction)
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    if (autoSlide) clearInterval(autoSlide);
    moveSlider(i);
  });
});

// Drag-to-slide (mouse / touch) for hero slider
(function() {
  if (!slider) return;
  let isDown = false;
  let startX = 0;
  let currentTranslate = 0;
  let pointerId = null;
  const getSlideWidth = () => (slider.children && slider.children[0]) ? slider.children[0].offsetWidth : window.innerWidth;

  slider.style.touchAction = 'pan-y';

  slider.addEventListener('pointerdown', (e) => {
    isDown = true;
    pointerId = e.pointerId;
    try { slider.setPointerCapture(pointerId); } catch (er) {}
    startX = e.clientX;
    const slideW = getSlideWidth();
    currentTranslate = -currentIndex * slideW;
    slider.style.transition = 'none';
    if (autoSlide) { clearInterval(autoSlide); autoSlide = null; }
  });

  slider.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const delta = e.clientX - startX;
    slider.style.transform = `translateX(${currentTranslate + delta}px)`;
  });

  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    try { slider.releasePointerCapture(pointerId); } catch (er) {}
    const slideW = getSlideWidth();
    const delta = (e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX)) - startX;
    const threshold = slideW * 0.18;
    if (delta < -threshold) moveSlider(currentIndex + 1);
    else if (delta > threshold) moveSlider(currentIndex - 1);
    else moveSlider(currentIndex);
    slider.style.transition = 'transform 0.9s cubic-bezier(0.23, 1, 0.32, 1)';
  }

  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);
  slider.addEventListener('pointerleave', endDrag);
})();

// 2. Location Management Logic
function toggleLocation() {
  const modal = document.getElementById("locModal");
  modal.classList.toggle("hidden");
  modal.classList.toggle("flex");
}

function updateCity(city) {
  // Update both Mobile and Laptop city labels
  const mobCity = document.getElementById("city-text-mob");
  const pcCity = document.getElementById("city-text-pc");

  if (mobCity) mobCity.innerText = city;
  if (pcCity) pcCity.innerText = city;

  // UI Feedback: Store in local storage
  localStorage.setItem("selectedCity", city);

  // Close modal with a small delay for smooth feel
  setTimeout(toggleLocation, 200);
  console.log(`Location updated to: ${city}`);
}

// 3. Search Filter Logic (Simulated for Demo)
const searchInputs = document.querySelectorAll(
  'input[placeholder="Search for tests"]',
);
searchInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    // Aap yahan backend API call ya local array filter laga sakte hain
    if (query.length > 2) {
      console.log(`Searching for: ${query}`);
      // Logic to show a dropdown can be added here
    }
  });
});

// CART LOGIC
let cart = [];
const WHATSAPP_NUM = "9348148310";

function addToCart(arg1, arg2) {
  // Support both signatures: addToCart(name, price) and addToCart({id, name, price})
  let item = null;
  if (arg1 && typeof arg1 === "object") {
    item = { id: arg1.id || Date.now(), name: arg1.name || "Item", price: Number(arg1.price) || 0 };
  } else {
    item = { id: Date.now(), name: arg1 || "Item", price: Number(arg2) || 0 };
  }

  cart.push(item);
  updateCartUI();
  toggleCart(true); // Open cart when item added
}

function toggleCart(show) {
  const sidebar = document.getElementById("cartSidebar");
  if (show) sidebar.classList.remove("translate-x-full");
  else sidebar.classList.add("translate-x-full");
}

function updateCartUI() {
  const cartContainer = document.getElementById("cartItems");
  const totalContainer = document.getElementById("cartTotal");
  const cartBadge = document.getElementById("header-cart-badge"); // use the header badge element if present

  cartContainer.innerHTML = cart
    .map(
      (item, index) => `
            <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span class="text-xs font-bold">${item.name}</span>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-black">₹${item.price}</span>
                    <button onclick="removeFromCart(${index})" class="text-red-400 text-xs"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  updateCartTotalWithCoupon(total);

  // Update header badge if exists
  if (cartBadge) {
    cartBadge.classList.remove("hidden");
    cartBadge.innerText = cart.length;
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function checkoutWhatsApp() {
  if (cart.length === 0) return alert("Cart is empty!");
  const itemsArr = cart.map((i, idx) => `${idx+1}. ${i.name} (₹${i.price})`);
  const items = itemsArr.join('\n');
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const city = localStorage.getItem('selectedCity') || (document.getElementById('city-text-pc') && document.getElementById('city-text-pc').innerText) || (document.getElementById('city-text-mob') && document.getElementById('city-text-mob').innerText) || 'Not specified';
  const msg = `*DIGICLINIX Booking*\n\n${items}\n\nTotal: ₹${total}\nBooking City: ${city}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`);
}

// Coupon logic (global)
const COUPONS = { DIGI50: { type: 'percent', value: 10, label: '10% off' }, FLAT100: { type: 'flat', value: 100, label: '₹100 off' }, SAVE50: { type: 'flat', value: 50, label: '₹50 off' } };
let appliedCoupon = null;

function computeDiscount(total) {
  if (!appliedCoupon) return { discount: 0, finalTotal: total };
  const c = COUPONS[appliedCoupon]; if (!c) return { discount: 0, finalTotal: total };
  const discount = c.type === 'percent' ? Math.round((c.value / 100) * total) : c.value;
  return { discount, finalTotal: Math.max(0, total - discount) };
}

function updateCartTotalWithCoupon(total) {
  const totalContainer = document.getElementById('cartTotal');
  const originalEl = document.getElementById('cart-original-total');
  const feedback = document.getElementById('coupon-feedback');
  const removeBtn = document.getElementById('remove-coupon-btn');
  const applyBtn = document.getElementById('apply-coupon-btn');
  const codeInput = document.getElementById('coupon-code');
  if (!totalContainer) return;
  if (appliedCoupon) {
    const { discount, finalTotal } = computeDiscount(total);
    if (originalEl) { originalEl.innerText = `₹${total}`; originalEl.classList.remove('hidden'); }
    totalContainer.innerText = `₹${finalTotal}`;
    if (feedback) { feedback.classList.remove('hidden'); feedback.innerText = `${COUPONS[appliedCoupon].label} applied — saved ₹${discount}`; }
    if (removeBtn) removeBtn.classList.remove('hidden');
    if (applyBtn) applyBtn.disabled = true;
    if (codeInput) codeInput.disabled = true;
  } else {
    if (originalEl) originalEl.classList.add('hidden');
    totalContainer.innerText = `₹${total}`;
    if (feedback) feedback.classList.add('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
    if (applyBtn) applyBtn.disabled = false;
    if (codeInput) codeInput.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('apply-coupon-btn');
  const removeBtn = document.getElementById('remove-coupon-btn');
  if (applyBtn) applyBtn.addEventListener('click', () => {
    const code = (document.getElementById('coupon-code').value || '').trim().toUpperCase();
    if (!code) return alert('Enter coupon code');
    if (!COUPONS[code]) return alert('Invalid coupon');
    appliedCoupon = code;
    updateCartUI();
  });
  if (removeBtn) removeBtn.addEventListener('click', () => { appliedCoupon = null; const ci = document.getElementById('coupon-code'); if (ci) ci.value=''; updateCartUI(); });
});

// SWIPER SYNC LOGIC
var infoSwiper = new Swiper(".infoSwiper", {
  allowTouchMove: false,
  effect: "fade",
  fadeEffect: { crossFade: true },
  speed: 800,
});

var cardSwiper = new Swiper(".cardSwiper", {
  speed: 800,
  navigation: { nextEl: ".custom-next", prevEl: ".custom-prev" },
  pagination: { el: ".custom-pagination", clickable: true },
});

cardSwiper.controller.control = infoSwiper;
infoSwiper.controller.control = cardSwiper;

new Swiper(".checkupSwiper", {
  slidesPerView: 1.15, // Mobile par next card peek karega
  spaceBetween: 20,
  grabCursor: true,
  navigation: {
    nextEl: ".checkup-next",
    prevEl: ".checkup-prev",
  },
  pagination: {
    el: ".checkup-pagination",
    clickable: true,
  },
  breakpoints: {
    640: { slidesPerView: 2.1 },
    1024: { slidesPerView: 4, spaceBetween: 24 },
  },
});


document.addEventListener('DOMContentLoaded', () => {
    // Page load hone ke 1.5 second baad popup dikhao
    setTimeout(() => {
        showOfferPopup();
    }, 1500);
});

function showOfferPopup() {
    const popup = document.getElementById('offerPopup');
    const content = document.getElementById('popupContent');

    if (popup && content) {
        popup.classList.remove('hidden');
        popup.classList.add('flex');
        
        // Animations apply karne ke liye thoda delay
        setTimeout(() => {
            popup.classList.remove('opacity-0');
            content.classList.remove('scale-90');
            content.classList.add('scale-100');
        }, 10);
    }
}

function closeOfferPopup() {
    const popup = document.getElementById('offerPopup');
    const content = document.getElementById('popupContent');

    content.classList.add('scale-90');
    popup.classList.add('opacity-0');

    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }, 500);
}

function copyCoupon() {
    const code = document.getElementById('promoCode').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('Coupon Code Copied: ' + code);
    });
}