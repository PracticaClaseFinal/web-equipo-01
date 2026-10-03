/* =========================================================
   FLORAL ROYAL - CONFIGURACIÓN RÁPIDA
   1) Cambia el número de WhatsApp por el real.
   2) Usa formato internacional sin +, espacios ni guiones.
      Ejemplo México: 5219991234567
   ========================================================= */
const CONFIG = {
  whatsappNumber: "521XXXXXXXXXX",
  businessName: "Floral Royal"
};

const state = {
  cart: JSON.parse(localStorage.getItem("floralRoyalCart") || "[]")
};

const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");

function saveCart() {
  localStorage.setItem("floralRoyalCart", JSON.stringify(state.cart));
}

function totalItems() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addProduct(name) {
  const existing = state.cart.find(item => item.name === name);
  if (existing) existing.qty += 1;
  else state.cart.push({ name, qty: 1 });
  saveCart();
  renderCart();
  showToast(`${name} agregado al pedido`);
}

function changeQty(name, delta) {
  const item = state.cart.find(product => product.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(product => product.name !== name);
  saveCart();
  renderCart();
}

function removeProduct(name) {
  state.cart = state.cart.filter(product => product.name !== name);
  saveCart();
  renderCart();
}

function renderCart() {
  cartCount.textContent = totalItems();
  cartItems.innerHTML = "";
  cartEmpty.style.display = state.cart.length ? "none" : "block";

  state.cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <small>Precio a confirmar</small>
        <div class="qty">
          <button type="button" data-action="minus" aria-label="Restar uno">−</button>
          <strong>${item.qty}</strong>
          <button type="button" data-action="plus" aria-label="Sumar uno">+</button>
        </div>
      </div>
      <button class="remove-item" type="button">Quitar</button>
    `;
    row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQty(item.name, -1));
    row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQty(item.name, 1));
    row.querySelector(".remove-item").addEventListener("click", () => removeProduct(item.name));
    cartItems.appendChild(row);
  });
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

function whatsappConfigured() {
  return /^\d{10,15}$/.test(CONFIG.whatsappNumber);
}

function openWhatsApp(customMessage = "") {
  if (!whatsappConfigured()) {
    alert("Antes de usar WhatsApp, abre script.js y reemplaza 521XXXXXXXXXX por tu número real en formato internacional.");
    return;
  }
  const message = customMessage || `Hola, me interesa conocer los productos de ${CONFIG.businessName}. ¿Me comparte precios y disponibilidad?`;
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function sendOrder() {
  if (!state.cart.length) {
    showToast("Agrega al menos un producto");
    return;
  }

  const lines = state.cart.map(item => `• ${item.name} x${item.qty}`).join("\n");
  const message = `Hola, quiero solicitar información para este pedido de ${CONFIG.businessName}:\n\n${lines}\n\n¿Me confirma precios, disponibilidad y opciones de entrega?`;
  openWhatsApp(message);
}

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", event => {
    const card = event.currentTarget.closest(".product-card");
    addProduct(card.dataset.product);
  });
});

document.querySelectorAll("[data-open-whatsapp]").forEach(button => {
  button.addEventListener("click", () => openWhatsApp());
});

[document.getElementById("cartButton"), document.getElementById("openCartFromCta"), document.getElementById("footerCart")]
  .filter(Boolean)
  .forEach(button => button.addEventListener("click", openCart));

document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("sendOrder").addEventListener("click", sendOrder);
document.getElementById("clearCart").addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
  showToast("Pedido vaciado");
});

document.getElementById("goShopping").addEventListener("click", closeCart);

menuBtn.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
