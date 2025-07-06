document.addEventListener("DOMContentLoaded", function() {
    // File input handling for multiple files
    const fileInput = document.getElementById("mediaFiles");
    const fileNameSpan = document.querySelector(".file-names");
    
    if (fileInput && fileNameSpan) {
        fileInput.addEventListener("change", function() {
            const files = Array.from(this.files);
            if (files.length > 0) {
                fileNameSpan.innerHTML = files.map(file => `<div>${file.name}</div>`).join('');
            } else {
                fileNameSpan.innerHTML = "";
            }
        });
    }
    
    // Modal functionality
    const modal = document.getElementById("mediaModal");
    const modalBody = document.getElementById("modalBody");
    const closeBtn = document.querySelector(".close");
    
    window.openModal = function(src, name, type) {
        if (type === "image") {
            modalBody.innerHTML = `<img src="${src}" alt="${name}" style="max-width: 100%; height: auto;">`;
        } else if (type === "video") {
            modalBody.innerHTML = `
                <video controls style="max-width: 100%; height: auto;">
                    <source src="${src}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }
        modal.style.display = "block";
    };
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
            modalBody.innerHTML = "";
        };
    }
    
    if (modal) {
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
                modalBody.innerHTML = "";
            }
        };
    }
    
    // Auto-hide messages after 5 seconds
    const messages = document.querySelectorAll(".error-message, .success-message");
    messages.forEach(function(message) {
        setTimeout(function() {
            message.style.opacity = "0";
            setTimeout(function() {
                message.style.display = "none";
            }, 300);
        }, 5000);
    });
    
    // Upload progress indication
    const uploadForm = document.querySelector(".upload-form");
    if (uploadForm) {
        uploadForm.addEventListener("submit", function() {
            const uploadBtn = this.querySelector(".upload-btn");
            if (uploadBtn) {
                uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;
                uploadBtn.disabled = true;
            }
        });
    }

    // Session keep-alive mechanism
    let sessionTimeout;
    const resetSessionTimeout = () => {
        clearTimeout(sessionTimeout);
        // Send a request to keep the session alive
        fetch('/keep-alive', { method: 'POST' });
        sessionTimeout = setTimeout(() => {
            alert("Your session has expired due to inactivity.");
            window.location.href = '/login'; // Redirect to login
        }, 30 * 60 * 1000); // 30 minutes
    };

    // Listen for user interactions
    window.addEventListener('mousemove', resetSessionTimeout);
    window.addEventListener('click', resetSessionTimeout);
    window.addEventListener('keypress', resetSessionTimeout);
    
    // Initialize session timeout
    resetSessionTimeout();

    // add public/js/main.js
let mediaPlaying = false;

// Extend session if playing video/photo
function checkMediaActivity() {
  const videoElements = document.querySelectorAll('video');
  mediaPlaying = Array.from(videoElements).some(video => !video.paused);

  if (mediaPlaying) {
    fetch('/keep-alive', { method: 'POST' });
  }
}

// Check every 5 minutes
setInterval(checkMediaActivity, 5 * 60 * 1000);

});
