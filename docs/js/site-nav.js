function toggleMenu() {
  const menu = document.getElementById('navbarMenu');
  if (!menu) return;
  menu.classList.toggle('active');
}

function closeMenu() {
  const menu = document.getElementById('navbarMenu');
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (menu) menu.classList.remove('active');
  if (dropdown) dropdown.classList.remove('active');
  if (dropdownMenu) dropdownMenu.style.maxHeight = null;
}

window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;

document.addEventListener('DOMContentLoaded', function () {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdown = document.querySelector('.dropdown');

  if (dropdownToggle && dropdown) {
    const handleToggle = function (event) {
      if (window.innerWidth <= 768) {
        event.preventDefault();
        event.stopPropagation();
        dropdown.classList.toggle('active');
      }
    };

    dropdownToggle.addEventListener('click', handleToggle);
    dropdownToggle.addEventListener('touchstart', handleToggle, { passive: false });
  }
});

document.addEventListener('click', function (event) {
  const navbar = document.querySelector('.navbar');
  const menu = document.getElementById('navbarMenu');
  const dropdown = document.querySelector('.dropdown');

  if (!navbar || !menu) return;

  if (!navbar.contains(event.target) && menu.classList.contains('active')) {
    menu.classList.remove('active');
    if (dropdown) dropdown.classList.remove('active');
  }
});
