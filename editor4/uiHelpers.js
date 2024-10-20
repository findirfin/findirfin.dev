function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    updateToggleButtonText();
}

function updateToggleButtonText() {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    toggleButton.textContent = sidebar.classList.contains('open') ? 'Hide Tools' : 'Show Tools';
}

export { toggleSidebar, updateToggleButtonText };