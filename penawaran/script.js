// Ganti dengan nomor WhatsApp Anda, format internasional tanpa "+" (contoh: 6281234567890)
const WA_NUMBER = "628999587888";

// Harga contoh dalam rupiah. Sesuaikan dengan biaya kerja dan pasar Anda.
const PACKAGES = {
  umkm: [
    { id: "mulai", name: "Mulai", for: "Usaha yang baru ingin tampil online", price: 750000,
      items: ["1 halaman (landing page)", "Info produk dan kontak", "Tombol WhatsApp dan peta", "Tampilan ramah ponsel", "1x revisi"] },
    { id: "bisnis", name: "Bisnis", for: "Usaha dengan beberapa produk atau layanan", price: 2000000,
      items: ["Hingga 5 halaman", "Katalog hingga 20 item", "Tombol pesan WhatsApp per produk", "SEO dasar", "2x revisi"] },
    { id: "toko", name: "Toko Plus", for: "Usaha dengan katalog lebih banyak", price: 3500000,
      items: ["5 sampai 8 halaman", "Katalog hingga 50 item", "Keranjang pesanan ke WhatsApp", "Pelatihan pengelolaan 1 jam", "3x revisi"] }
  ],
  hotel: [
    { id: "hotel-dasar", name: "Hotel Dasar", for: "Penginapan yang butuh etalase online", price: 4000000,
      items: ["5 halaman (Beranda, Kamar, Fasilitas, Galeri, Kontak)", "Daftar kamar dan tarif", "Formulir permintaan reservasi", "SEO lokal dasar", "2x revisi"] },
    { id: "hotel-plus", name: "Hotel Plus", for: "Hotel yang melayani tamu mancanegara", price: 7500000,
      items: ["Semua isi Hotel Dasar", "Dua bahasa (Indonesia dan Inggris)", "Halaman paket dan promo, blog", "Tautan ke sistem reservasi yang sudah dipakai", "3x revisi"] }
  ]
};

const ADDONS = [
  { id: "foto", name: "Foto produk atau kamar profesional", price: 750000 },
  { id: "konten", name: "Penulisan konten", price: 500000 },
  { id: "bahasa", name: "Bahasa tambahan", price: 1000000 },
  { id: "rawat", name: "Perawatan bulanan (update, cadangan, keamanan)", price: 250000, monthly: true }
];

const rp = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const $ = s => document.querySelector(s);
const state = { seg: "umkm", pkg: "bisnis", addons: new Set() };

function currentPkg() { return PACKAGES[state.seg].find(p => p.id === state.pkg); }

function renderPackages() {
  const box = $("#packages");
  box.innerHTML = "";
  PACKAGES[state.seg].forEach(p => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pkg";
    b.setAttribute("aria-pressed", p.id === state.pkg);
    b.innerHTML = `<h3></h3><p class="for"></p><ul></ul><span class="price"></span>`;
    b.querySelector("h3").textContent = p.name;
    b.querySelector(".for").textContent = p.for;
    p.items.forEach(t => { const li = document.createElement("li"); li.textContent = t; b.querySelector("ul").appendChild(li); });
    b.querySelector(".price").textContent = rp(p.price);
    b.addEventListener("click", () => { state.pkg = p.id; renderPackages(); renderSummary(); });
    box.appendChild(b);
  });
}

function renderAddons() {
  const box = $("#addons");
  ADDONS.forEach(a => {
    const l = document.createElement("label");
    l.innerHTML = `<input type="checkbox"><span></span><span></span>`;
    l.querySelector("span").textContent = a.name;
    l.querySelectorAll("span")[1].textContent = rp(a.price) + (a.monthly ? " per bulan" : "");
    l.querySelector("input").addEventListener("change", e => {
      e.target.checked ? state.addons.add(a.id) : state.addons.delete(a.id);
      renderSummary();
    });
    box.appendChild(l);
  });
}

function renderSummary() {
  const p = currentPkg();
  const chosen = ADDONS.filter(a => state.addons.has(a.id));
  const once = p.price + chosen.filter(a => !a.monthly).reduce((s, a) => s + a.price, 0);
  const monthly = chosen.filter(a => a.monthly).reduce((s, a) => s + a.price, 0);
  const rows = [["Paket", p.name + " (" + rp(p.price) + ")"]];
  chosen.forEach(a => rows.push([a.name, rp(a.price) + (a.monthly ? " per bulan" : "")]));
  rows.push(["Uang muka 50%", rp(once / 2)]);
  if (monthly) rows.push(["Perawatan bulanan", rp(monthly) + " per bulan"]);
  $("#summary").innerHTML = rows.map(() => "<div><dt></dt><dd></dd></div>").join("") + '<div class="total"><dt>Total sekali bayar</dt><dd></dd></div>';
  const divs = $("#summary").querySelectorAll("div:not(.total)");
  rows.forEach((r, i) => { divs[i].querySelector("dt").textContent = r[0]; divs[i].querySelector("dd").textContent = r[1]; });
  $("#summary .total dd").textContent = rp(once);

  const msg = ["Halo MENUANG, saya tertarik dengan penawaran website.",
    "Jenis usaha: " + (state.seg === "umkm" ? "UMKM" : "Hotel dan penginapan"),
    "Paket: " + p.name,
    ...chosen.map(a => "Tambahan: " + a.name),
    "Total sekali bayar: " + rp(once) + (monthly ? " + perawatan " + rp(monthly) + " per bulan" : "")].join("\n");
  $("#wa").href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
}

document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
  state.seg = b.dataset.seg;
  state.pkg = PACKAGES[state.seg][state.seg === "umkm" ? 1 : 0].id;
  document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-checked", x === b));
  renderPackages(); renderSummary();
}));
$("#print").addEventListener("click", () => window.print());

renderPackages(); renderAddons(); renderSummary();
