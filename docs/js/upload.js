// upload.js
const fileInput = document.getElementById("fileInput");
const decodeBtn = document.getElementById("decodeBtn");
const clearBtn = document.getElementById("clearBtn");
const uploadMsg = document.getElementById("uploadMsg");
let lastFile = null;

fileInput?.addEventListener("change", (e) => {
  lastFile = e.target.files[0] || null;
  uploadMsg.textContent = lastFile ? `File: ${lastFile.name}` : "Belum ada file.";
});

decodeBtn?.addEventListener("click", () => {
  if (!lastFile) return showPopup("Pilih file gambar terlebih dahulu.");
  decodeImageFile(lastFile);
});

clearBtn?.addEventListener("click", () => {
  fileInput.value = "";
  lastFile = null;
  uploadMsg.textContent = "Belum ada file.";
  clearRawQR();
});

function decodeImageFile(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    // resize for performance if too large
    const max = 1200;
    let w = img.width;
    let h = img.height;
    if (w > max || h > max) {
      const ratio = Math.min(max / w, max / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (code && code.data) {
      saveRawQR(code.data);
    showPopup(
    "QRIS berhasil dibaca dari gambar.\nLanjut ke input nominal.",
    () => {
      location.href = "process.html";
    }
  );

} else {
  showPopup("Gagal membaca QR dari gambar. Pastikan gambar jelas dan QR tidak terpotong.");
}
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => {
    showPopup("Gagal memuat gambar.");
    URL.revokeObjectURL(img.src);
  };
}
