// 1. Slider Functionality (Auto-slide & Pagination)
const slider = document.getElementById("slider");
const dots = document.querySelectorAll(".slider-dot");
const count = document.getElementById("slide-count");
let currentIndex = 0;
const totalSlides = dots.length;

function moveSlider(index) {
  currentIndex = index;
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  // Update Counter (1/2, 2/2)
  if (count) count.innerText = currentIndex + 1;

  // Update Dots active state
  dots.forEach((dot, i) => {
    dot.classList.toggle("active-dot", i === currentIndex);
    dot.classList.toggle("opacity-50", i !== currentIndex);
  });
}

// Auto Slide every 5 seconds
let autoSlide = setInterval(() => {
  currentIndex = (currentIndex + 1) % totalSlides;
  moveSlider(currentIndex);
}, 5000);

// Manual Dot Click
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    clearInterval(autoSlide); // Stop auto-slide on manual click
    moveSlider(i);
  });
});

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
  totalContainer.innerText = `₹${total}`;

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
  const items = cart.map((i) => `${i.name} (₹${i.price})`).join(", ");
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const msg = `Hello DIGICLINIXHealth, I want to book these tests: ${items}. Total: ₹${total}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`);
}

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
