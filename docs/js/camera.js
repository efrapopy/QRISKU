// camera.js
let mediaStream = null;
const video = document.getElementById("cameraPreview");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

startBtn?.addEventListener("click", startCamera);
stopBtn?.addEventListener("click", stopCamera);

async function startCamera() {
  if (!supportsCamera()) {
    showPopup("Perangkatmu tidak mendukung kamera melalui browser."); 
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = mediaStream;
    video.play();
    statusEl.textContent = "Status: kamera aktif — arahkan ke QR.";
    scanCameraLoop();
  } catch (err) {
    showPopup("Gagal mengakses kamera:\n" + (err.message || err));
    statusEl.textContent = "Status: gagal akses kamera";
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
    statusEl.textContent = "Status: kamera dimatikan";
  }
}

function scanCameraLoop() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const loop = () => {
    if (!mediaStream) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code && code.data) {
        // simpan rawQR dan lanjut ke proses
        saveRawQR(code.data);
stopCamera();
showPopup(
    "QRIS berhasil discan.\nLanjut ke input nominal.",
    () => {
      location.href = "process.html";
    }
  );

       
        return;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
