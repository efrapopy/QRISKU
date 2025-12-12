// common.js
// util untuk menyimpan / mengambil raw QR dari localStorage
const LS_KEY_RAW = "qrisku_raw_qr";

function saveRawQR(raw) {
  if (!raw) return;
  localStorage.setItem(LS_KEY_RAW, raw);
}

function getRawQR() {
  return localStorage.getItem(LS_KEY_RAW) || "";
}

function clearRawQR() {
  localStorage.removeItem(LS_KEY_RAW);
}

// CRC16-CCITT (X25 style used by QRIS 6304 calculation)
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// safe navigator helpers
function supportsCamera() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
