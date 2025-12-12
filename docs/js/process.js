// process.js

const rawPreview = document.getElementById("rawPreview");
const amountInput = document.getElementById("amount");
const genBtn = document.getElementById("genBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resultSection = document.getElementById("result");
const clearLocalBtn = document.getElementById("clearLocalBtn");
const canvasPreview = document.getElementById("canvasPreview");

let finalAmount = 0;
let canvasImageURL = "";

// =========================
// TAMPILKAN RAW QR
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const raw = getRawQR();
  if (!raw) {
    rawPreview.textContent = "(tidak ditemukan) — Silakan scan atau upload terlebih dahulu.";
  } else {
    rawPreview.textContent = raw.length > 80 ? raw.slice(0, 80) + "..." : raw;
  }
});

// =========================
// GENERATE QR BARU
// =========================
genBtn.addEventListener("click", async () => {
  const raw = getRawQR();
  if (!raw) return showPopup("Tidak ada QR diproses. Silakan scan atau upload ulang.");

  const nominal = parseInt(amountInput.value || 0);

  if (!nominal || nominal <= 0) {
    return showPopup("Masukkan nominal yang valid.");
  }

  // TOTAL TANPA FEE
  finalAmount = nominal;

  // Hapus CRC existing
  let base = raw.replace(/6304[0-9A-Fa-f]{4}$/i, "");

// Hapus Tag 54 lama (aman)
base = base.replace(/54\d{2}[0-9]+?(?=5[0-9]|6[0-9]|$)/, "");



  // Tag 54 (amount)
  const amountStr = String(finalAmount);
  const len = amountStr.length.toString().padStart(2, "0");

  const tag54 = "54" + len + amountStr;

  let newQR = base + tag54 + "6304";

  const crc = crc16(newQR);
  const finalQR = newQR + crc;

  // generate QR image
  const qrURL =
    `https://quickchart.io/qr?text=${encodeURIComponent(finalQR)}&size=500&margin=0&format=png&ecLevel=H`;

  await drawQR(qrURL);

  resultSection.classList.remove("hidden");
});



// =========================
// RESET (hapus local QR data)
// =========================
clearLocalBtn.addEventListener("click", () => {
  clearRawQR();
   showPopup(
    "Data QR dihapus.\nSilakan scan atau upload ulang.",
    () => {
      location.href = "index.html";
    }
  );

});

// =========================
// DOWNLOAD QR PNG
// =========================
downloadBtn.addEventListener("click", () => {
  if (!canvasImageURL) return;

  const link = document.createElement("a");
  link.href = canvasImageURL;
  link.download = "QRIS_" + finalAmount + ".png";
  link.click();
});

// =========================
// DRAW QR TO CANVAS
// =========================
async function drawQR(url) {
  const ctx = canvasPreview.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasPreview.width, canvasPreview.height);

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise(resolve => {
    img.onload = () => {
      const qrSize = 300;
      const x = (canvasPreview.width - qrSize) / 2;

      ctx.drawImage(img, x, 40, qrSize, qrSize);

      // Label amount
      ctx.fillStyle = "#111";
      ctx.font = "700 18px Inter, sans-serif";
      ctx.textAlign = "center";

      // Yellow box
      const rectW = 240;
      const rectH = 34;
      const rectX = (canvasPreview.width - rectW) / 2;
      const rectY = 0;

      roundRect(ctx, rectX, rectY, rectW, rectH, 8, true, false, "#ffd400");

      ctx.fillStyle = "#111";
      ctx.fillText("Rp " + finalAmount.toLocaleString("id-ID"), canvasPreview.width / 2, 24);

      canvasImageURL = canvasPreview.toDataURL("image/png");

      resolve();
    };

    img.onerror = () => {
      showPopup("Gagal memuat QR dari generator.");
      resolve();
    };

    img.src = url;
  });
}

// Rounded rectangle helper
function roundRect(ctx, x, y, w, h, r, fill, stroke, color) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = color || "#ffd400";
    ctx.fill();
  }
  if (stroke) ctx.stroke();
}

// =========================
// KEYPAD
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".keypad button").forEach(btn => {
    const val = btn.dataset.val;
    const action = btn.dataset.action;

    btn.addEventListener("click", () => {
      if (action === "clear") {
        amountInput.value = "";
        return;
      }

      if (action === "del") {
        amountInput.value = amountInput.value.slice(0, -1);
        return;
      }

      if (val !== undefined) {
        amountInput.value += val;
      }
    });
  });
});
