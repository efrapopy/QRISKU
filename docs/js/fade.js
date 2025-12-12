// Fungsi untuk menambahkan efek fade-in saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Menambahkan efek fade-in saat halaman dimuat
  document.body.classList.add('fade-in');

  // Menambahkan efek fade-in ke elemen tertentu
  const elementsToFade = document.querySelectorAll('.fade-element');
  elementsToFade.forEach(element => {
    element.classList.add('fade-in');
  });
});

// Fungsi untuk menangani efek fade-out saat halaman berpindah
window.addEventListener('beforeunload', () => {
  // Menambahkan efek fade-out saat halaman akan berpindah
  document.body.classList.add('fade-out');
});

// Fungsi untuk berpindah antar halaman dengan efek fade-out
function transitionPage(url) {
  // Menambahkan efek fade-out pada halaman
  document.body.classList.add('fade-out');
  setTimeout(() => {
    // Setelah efek fade-out selesai, pindah ke halaman lain
    window.location.href = url; // Ganti dengan URL halaman yang diinginkan
  }, 500); // Durasi yang sama dengan efek fade-out
}
