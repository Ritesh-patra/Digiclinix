// 1. Slider Functionality (Auto-slide & Pagination)
const slider = document.getElementById("slider");
const count = document.getElementById("slide-count");
const slideTotalEl = document.getElementById('slide-total');
let currentIndex = 0;
let totalSlides = slider ? slider.children.length : 1;
let autoSlide = null;

// Build pagination dots dynamically if a container exists
function buildDots() {
  const container = document.getElementById('sliderDots');
  if (!container) return [];
  container.innerHTML = '';
  const arr = [];
  for (let i = 0; i < totalSlides; i++) {
    const btn = document.createElement('button');
    btn.className = 'slider-dot w-3 h-3 rounded-full bg-white/40 opacity-60';
    btn.setAttribute('aria-label', `Go to slide ${i+1}`);
    btn.addEventListener('click', () => {
      if (autoSlide) { clearInterval(autoSlide); autoSlide = null; }
      moveSlider(i);
    });
    container.appendChild(btn);
    arr.push(btn);
  }
  return arr;
}

// initialize dots (may be empty)
let dots = buildDots();
if (slideTotalEl) slideTotalEl.innerText = totalSlides;

function moveSlider(index) {
  if (!slider) return;
  // recalc totalSlides in case DOM changed
  totalSlides = slider.children.length || totalSlides;
  if (slideTotalEl) slideTotalEl.innerText = totalSlides;
  currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
  // ensure smooth transition
  slider.style.transition = 'transform 0.9s cubic-bezier(0.23, 1, 0.32, 1)';
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  // Update Counter (1/2, 2/2)
  if (count) count.innerText = (currentIndex + 1);

  // Update Dots active state only if dots exist
  const dotEls = Array.from(document.querySelectorAll('.slider-dot'));
  if (dotEls.length) {
    dotEls.forEach((dot, i) => {
      dot.classList.toggle("active-dot", i === currentIndex);
      dot.classList.toggle("opacity-50", i !== currentIndex);
    });
  }
}

// Auto Slide every 5 seconds (only if more than one slide)
if (totalSlides > 1) {
  autoSlide = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    moveSlider(currentIndex);
  }, 5000);
}

// Manual Dot Click (stop auto-slide on manual interaction)
// If dots were added statically, wire them; otherwise buildDots already wired dynamic ones
Array.from(document.querySelectorAll('.slider-dot')).forEach((dot, i) => {
  dot.addEventListener('click', () => { if (autoSlide) clearInterval(autoSlide); moveSlider(i); });
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
const WHATSAPP_NUM = "9676138576";

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
                    <button onclick="removeFromCart(${index})" class="text-red-400 text-xs flex-shrink-0 z-10"><i class="fas fa-trash"></i></button>
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
  // include coupon and discount details if applied
  const { discount, finalTotal } = computeDiscount(total);
  const couponLine = appliedCoupon && COUPONS[appliedCoupon] ? `Coupon: ${appliedCoupon} (${COUPONS[appliedCoupon].label})\nSaved: ₹${discount}\n` : '';
  const msg = `*DIGICLINIX DIAGNOSTICS Booking*\n\n${items}\n\nSubtotal: ₹${total}\n${couponLine}Payable: ₹${finalTotal}\nBooking City: ${city}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`);
}

// Coupon logic (global)
const COUPONS = {
  DIGI10: { type: 'percent', value: 10, label: '10% off' },
  FREECONSULT: { type: 'flat', value: 0, label: 'Free consult' }
};
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

// Consolidated site-wide services index so the homepage search can query all pages
window.GLOBAL_SERVICES = (function(){
  const list = [];

  // Lab Testing (from labtesting.html)
  const lab = [
    { id: 'lab-1', name: "CBC (Complete Blood Count)", price: 350, desc: "Hemoglobin, WBC, RBC, Platelet Count", page: 'labtesting.html' },
    { id: 'lab-2', name: "HbA1c (Glycosylated Hb)", price: 490, desc: "Average Sugar (3 Months)", page: 'labtesting.html' },
    { id: 'lab-3', name: "Fasting Blood Sugar (FBS)", price: 180, desc: "Glucose - Fasting", page: 'labtesting.html' },
    { id: 'lab-4', name: "Thyroid Function Test (TFT)", price: 400, desc: "T3, T4, TSH", page: 'labtesting.html' },
    { id: 'lab-5', name: "Urine Complete Analysis", price: 250, desc: "pH, Sugar, Protein, Microscopic Exam", page: 'labtesting.html' },
    { id: 'lab-6', name: "Lipid Profile", price: 550, desc: "Cholesterol, Triglycerides, HDL, LDL", page: 'labtesting.html' },
    { id: 'lab-7', name: "Liver Function Test (LFT)", price: 700, desc: "Bilirubin, SGOT, SGPT, Albumin", page: 'labtesting.html' },
    { id: 'lab-8', name: "Kidney Function Test (KFT)", price: 700, desc: "Urea, Creatinine, Electrolytes", page: 'labtesting.html' },
    { id: 'lab-9', name: "Vitamin B12", price: 790, desc: "Cyanocobalamin", page: 'labtesting.html' },
    { id: 'lab-10', name: "Vitamin D, Total", price: 990, desc: "25-Hydroxy Vitamin D", page: 'labtesting.html' },
    { id: 'lab-11', name: "C-Reactive Protein (CRP)", price: 500, desc: "Inflammation Marker", page: 'labtesting.html' },
    { id: 'lab-12', name: "PPBS (Post Prandial)", price: 180, desc: "Blood Glucose - After Meal", page: 'labtesting.html' },
    { id: 'lab-13', name: "Urine Culture", price: 900, desc: "Bacterial Sensitivity", page: 'labtesting.html' },
    { id: 'lab-14', name: "Creatinine", price: 200, desc: "Kidney Health Marker", page: 'labtesting.html' },
    { id: 'lab-15', name: "Beta HCG (Pregnancy)", price: 750, desc: "Pregnancy Confirmation", page: 'labtesting.html' },
    { id: 'lab-16', name: "Blood Sugar (Random)", price: 180, desc: "Glucose - Instant", page: 'labtesting.html' },
    { id: 'lab-17', name: "CBC with ESR", price: 450, desc: "CBC, Sedimentation Rate", page: 'labtesting.html' },
    { id: 'lab-18', name: "Dengue Profile", price: 900, desc: "NS1, IgG, IgM", page: 'labtesting.html' },
    { id: 'lab-19', name: "Platelet Count", price: 150, desc: "Thrombocytes", page: 'labtesting.html' },
    { id: 'lab-20', name: "TSH Only", price: 350, desc: "Thyroid Stimulating Hormone", page: 'labtesting.html' }
  ];

  // Vitamin tests (from vitamncheckup.html)
  const vit = [
    { id: 'vit-1', name: "Vitamin D, Total", price: 990, desc: "Essential for bone health and immunity.", page: 'vitamncheckup.html' },
    { id: 'vit-2', name: "Vitamin B12", price: 790, desc: "Crucial for nerve function and energy levels.", page: 'vitamncheckup.html' },
    { id: 'vit-3', name: "Vitamin D Gold Panel", price: 2725, desc: "Includes Vit D2, Vit D3 & Vit D Total.", page: 'vitamncheckup.html' },
    { id: 'vit-4', name: "Folic Acid (Vit B9)", price: 1200, desc: "Important for red blood cell formation.", page: 'vitamncheckup.html' },
    { id: 'vit-5', name: "Vitamin C (Ascorbic Acid)", price: 3750, desc: "Powerful antioxidant for skin and immunity.", page: 'vitamncheckup.html' },
    { id: 'vit-6', name: "Vitamin B Complex", price: 8470, desc: "Comprehensive panel for all B Vitamins.", page: 'vitamncheckup.html' },
    { id: 'vit-7', name: "Vitamin A (Retinol)", price: 4795, desc: "Essential for vision and immune health.", page: 'vitamncheckup.html' },
    { id: 'vit-8', name: "Vitamin B6 (Pyridoxal)", price: 3500, desc: "Supports brain development and function.", page: 'vitamncheckup.html' },
    { id: 'vit-9', name: "Vitamin E (Tocopherol)", price: 4540, desc: "Key for skin, hair and eye health.", page: 'vitamncheckup.html' },
    { id: 'vit-10', name: "Vitamin B1 (Thiamine)", price: 3870, desc: "Helps convert food into energy.", page: 'vitamncheckup.html' },
    { id: 'vit-11', name: "Vitamin K1", price: 4950, desc: "Vital for blood clotting and bone health.", page: 'vitamncheckup.html' },
    { id: 'vit-12', name: "Vitamin B2 (Riboflavin)", price: 3815, desc: "Essential for growth and overall health.", page: 'vitamncheckup.html' }
  ];

  // Women care (from Womencare.html)
  const women = [
    { id: 'women-W1', name: "Women Health Checkup - Essential", price: 1599, desc: "71 parameters — Reports within 6 Hours", page: 'Womencare.html' },
    { id: 'women-W2', name: "Women Health Checkup - Advanced", price: 2699, desc: "97 parameters — Reports within 6 Hours", page: 'Womencare.html' },
    { id: 'women-W3', name: "Women Health Checkup - Comprehensive", price: 3799, desc: "100 parameters — Reports within 12 Hours", page: 'Womencare.html' },
    { id: 'women-P1', name: "PCOD Screening", price: 1499, desc: "35 parameters — Reports within 12 Hours", page: 'Womencare.html' },
    { id: 'women-P2', name: "PCOD Screening - Comprehensive", price: 5999, desc: "39 parameters — Reports within 12 Hours", page: 'Womencare.html' },
    { id: 'women-A1', name: "Antenatal Checkup - Basic", price: 999, desc: "57 parameters — Reports within 12 Hours", page: 'Womencare.html' },
    { id: 'women-A2', name: "Antenatal Checkup - Comprehensive", price: 1499, desc: "59 parameters — Reports within 12 Hours", page: 'Womencare.html' }
  ];

  // Homepage offerings (from index.html)
  const home = [
    { id: 'home-1', name: 'Essential Checkup', price: 1599, desc: 'Basic full body panel suitable for routine screening.', page: 'index.html' },
    { id: 'home-2', name: 'Advanced Checkup', price: 2799, desc: 'Expanded panel with metabolic and cardiac markers.', page: 'index.html' },
    { id: 'home-3', name: 'Ultra Male Checkup', price: 11999, desc: 'Comprehensive male-specific full body panel.', page: 'index.html' },
    { id: 'home-4', name: 'Ultra Female Checkup', price: 11999, desc: 'Comprehensive female-specific full body panel.', page: 'index.html' }
  ];

  return list.concat(lab, vit, women, home);
})();