// Interactive Resume JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Toast notification system
  const showToast = (message) => {
    let toast = document.getElementById('resume-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'resume-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 2500);
  };

  // Copy email or phone on click
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = el.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const type = el.getAttribute('data-type') || 'Contact';
          showToast(`✓ ${type} copied to clipboard!`);
        }).catch(() => {
          showToast('Failed to copy');
        });
      }
    });
  });

  // Print / Save as PDF
  const printBtn = document.getElementById('print-resume-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
