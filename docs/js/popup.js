function showPopup(message, onClose = null) {
  const popup = document.getElementById("popup");
  const popupMsg = document.getElementById("popupMessage");
  const popupClose = document.getElementById("popupClose");

  popupMsg.textContent = message;
  popup.classList.remove("hidden");

  popupClose.onclick = () => {
    popup.classList.add("hidden");
    if (typeof onClose === "function") onClose();
  };
}
