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

  // Set canvas width and height to higher resolution for better quality
  const highResCanvas = document.createElement("canvas");
  const highResCtx = highResCanvas.getContext("2d");

  // Set high resolution (e.g., 1000x1000)
  highResCanvas.width = 400;
  highResCanvas.height = 460;

  // Draw the QR code to the high-resolution canvas
  highResCtx.drawImage(canvasPreview, 0, 0, highResCanvas.width, highResCanvas.height);

  const highResImageURL = highResCanvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = highResImageURL;
  link.download = "QRIS_" + finalAmount + ".png";  // Name the downloaded file
  link.click();  // Automatically click the download link
});


// =========================
// DRAW QR TO CANVAS
// =========================
async function drawQR(url) {
  // Selalu set canvas jadi square
  canvasPreview.width = 400;
  canvasPreview.height = 460;

  const ctx = canvasPreview.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasPreview.width, canvasPreview.height);

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise(resolve => {
    img.onload = () => {

      // QR square — tidak akan gepeng
      const qrSize = 340;
      const x = (canvasPreview.width - qrSize) / 2;

      ctx.drawImage(img, x, 60, qrSize, qrSize);

      // Label amount
      ctx.fillStyle = "#111";
      ctx.font = "700 20px Inter, sans-serif";
      ctx.textAlign = "center";

      // Yellow box
      const rectW = 260;
      const rectH = 40;
      const rectX = (canvasPreview.width - rectW) / 2;
      const rectY = 10;

      roundRect(ctx, rectX, rectY, rectW, rectH, 10, true, false, "#ffd400");

      ctx.fillStyle = "#111";
      ctx.fillText("Rp " + finalAmount.toLocaleString("id-ID"), canvasPreview.width / 2, 38);

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
// KEYPAD (VALIDASI FULL)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".keypad button").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      const action = btn.dataset.action;

      let current = amountInput.value;

      // CLEAR
      if (action === "clear") {
        amountInput.value = "";
        genBtn.disabled = false;
        return;
      }

      // DELETE
      if (action === "del") {
        amountInput.value = current.slice(0, -1);
        genBtn.disabled = false;
        return;
      }

      // INPUT ANGKA
      if (val !== undefined) {

        // CEGAH > 8 DIGIT (langsung tolak)
        if (current.length >= 8) {
          showPopup("Maksimal 8 digit angka.");
          return;
        }

        // Cek nilai baru SEBELUM diset
        let newValue = current + val;
        let numeric = parseInt(newValue);

        // CEGAH > 10.000.000
        if (numeric > 10000000) {
          showPopup("Nominal tidak boleh lebih dari 10.000.000.");
          genBtn.disabled = true;
          return;
        }

        // Kalau aman → update
        amountInput.value = newValue;
        genBtn.disabled = false;
      }
    });
  });
});



// =========================
// VALIDASI INPUT NOMINAL
// =========================
amountInput.addEventListener("input", () => {
  let value = amountInput.value;

  // Hapus non-angka
  value = value.replace(/\D/g, "");

  // Batas 8 digit
  if (value.length > 8) {
    value = value.slice(0, 8);
    showPopup("Maksimal 8 digit angka.");
  }

  amountInput.value = value;

  // Batas 10 juta
  if (parseInt(value) > 10000000) {
    showPopup("Nominal tidak boleh lebih dari 10.000.000.");
    genBtn.disabled = true;
  } else {
    genBtn.disabled = false;
  }
});

