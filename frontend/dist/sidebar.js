// Mobile sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('menu-button');
  const closeButton = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  // Open sidebar
  if (menuButton) {
    menuButton.addEventListener('click', function() {
      sidebar.classList.remove('-translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close sidebar
  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when window is resized to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
});
