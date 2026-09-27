// API Base URL config: handles running frontend via file://, a static server, or directly from Flask
const API_BASE = (window.location.protocol === 'file:' || !window.location.origin.includes('5000'))
    ? 'http://127.0.0.1:5000'
    : '';

// DOM Elements
const profileForm = document.getElementById('profileForm');
const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
const imageUrlInput = document.getElementById('imageUrl');
const emailInput = document.getElementById('email');
const locationInput = document.getElementById('location');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const activeCardContainer = document.getElementById('activeCardContainer');
const historyGrid = document.getElementById('historyGrid');
const savedCountText = document.getElementById('savedCount');
const toastContainer = document.getElementById('toastContainer');
const avatarOptions = document.querySelectorAll('.avatar-option');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadSavedProfiles();
    setupAvatarPicker();
});

// Setup Quick Select Avatars
function setupAvatarPicker() {
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from others
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked avatar
            option.classList.add('selected');
            
            // Populate input
            const url = option.getAttribute('data-url');
            imageUrlInput.value = url;
            
            showToast('Avatar selected!', 'success');
        });
    });

    // Remove selection outline if user manually edits URL input
    imageUrlInput.addEventListener('input', () => {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
    });
}

// Validation Utilities
function validateEmail(email) {
    const regex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return regex.test(email);
}

function validateURL(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// XSS Prevention Utility
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Date Formatter
function formatDate(dateString) {
    if (!dateString) return 'Recent';
    try {
        // SQLite dates look like "2026-06-17 20:35:21" or similar
        // Convert spaces to 'T' for proper JS parsing if needed
        const formattedString = dateString.replace(' ', 'T');
        const date = new Date(formattedString);
        
        // Fallback for invalid dates
        if (isNaN(date.getTime())) {
            return dateString.split(' ')[0] || 'Recent';
        }
        
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (_) {
        return 'Recent';
    }
}

// Toast Notifications System
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fa-solid fa-circle-check"></i>' 
        : '<i class="fa-solid fa-circle-exclamation"></i>';
        
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

// Render Profile Card in Preview Pane
function renderPreviewCard(profile) {
    // Hide placeholder
    previewPlaceholder.style.display = 'none';
    
    // Construct Card HTML
    const emailSection = profile.email 
        ? `<a href="mailto:${profile.email}" class="card-info-item" target="_blank">
             <i class="fa-solid fa-envelope"></i>
             <span>${escapeHTML(profile.email)}</span>
           </a>`
        : '';
        
    const locationSection = profile.location
        ? `<div class="card-location">
             <i class="fa-solid fa-location-dot"></i>
             <span>${escapeHTML(profile.location)}</span>
           </div>`
        : '';

    activeCardContainer.innerHTML = `
        <div class="profile-card">
            <div class="card-header-bg"></div>
            <div class="card-body">
                <div class="card-avatar-wrapper">
                    <img src="${profile.image_url}" class="card-avatar" alt="${escapeHTML(profile.name)}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';">
                </div>
                <h3 class="card-name">${escapeHTML(profile.name)}</h3>
                ${locationSection}
                <p class="card-bio">${escapeHTML(profile.bio)}</p>
                <div class="card-divider"></div>
                <div class="card-info">
                    ${emailSection}
                    <div class="card-info-item">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>Saved: ${formatDate(profile.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    activeCardContainer.style.display = 'block';
}

// Fetch Saved Profiles from Database
async function loadSavedProfiles() {
    try {
        const response = await fetch(`${API_BASE}/profiles`);
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to fetch profiles:', data.error);
            return;
        }
        
        const profiles = data.profiles || [];
        savedCountText.textContent = `${profiles.length} profile${profiles.length === 1 ? '' : 's'} saved`;
        
        if (profiles.length === 0) {
            historyGrid.innerHTML = `
                <div class="no-history">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>No profile cards created yet. Fill the form to get started!</p>
                </div>
            `;
            return;
        }
        
        historyGrid.innerHTML = '';
        
        profiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <img src="${profile.image_url}" class="history-card-avatar" alt="${escapeHTML(profile.name)}" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';">
                <div class="history-card-info">
                    <div class="history-card-name">${escapeHTML(profile.name)}</div>
                    ${profile.location ? `<div class="history-card-location">${escapeHTML(profile.location)}</div>` : ''}
                    <div class="history-card-date">${formatDate(profile.created_at)}</div>
                </div>
            `;
            
            // Add click event to load history card back to preview pane
            card.addEventListener('click', () => {
                renderPreviewCard(profile);
                activeCardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showToast(`Viewing profile card of ${profile.name}`, 'success');
            });
            
            historyGrid.appendChild(card);
        });
        
    } catch (err) {
        console.error('Error fetching profiles:', err);
    }
}

// Form Submission & POST Request
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous form validation highlights
    const inputs = profileForm.querySelectorAll('.form-control');
    inputs.forEach(input => input.style.borderColor = '');
    
    const name = nameInput.value.trim();
    const bio = bioInput.value.trim();
    const imageUrl = imageUrlInput.value.trim();
    const email = emailInput.value.trim();
    const location = locationInput.value.trim();
    
    // Front-end Validations
    let validationErrors = [];
    
    if (!name) {
        validationErrors.push("Name is required.");
        nameInput.style.borderColor = 'var(--error)';
    }
    if (!bio) {
        validationErrors.push("Bio is required.");
        bioInput.style.borderColor = 'var(--error)';
    }
    if (!imageUrl) {
        validationErrors.push("Profile Image URL is required.");
        imageUrlInput.style.borderColor = 'var(--error)';
    } else if (!validateURL(imageUrl)) {
        validationErrors.push("Image URL must start with http:// or https://.");
        imageUrlInput.style.borderColor = 'var(--error)';
    }
    
    if (email && !validateEmail(email)) {
        validationErrors.push("Please provide a valid email format.");
        emailInput.style.borderColor = 'var(--error)';
    }
    
    if (validationErrors.length > 0) {
        validationErrors.forEach(err => showToast(err, 'error'));
        return;
    }
    
    // Prepare JSON Request payload
    const payload = {
        name,
        bio,
        image_url: imageUrl,
        email: email || null,
        location: location || null
    };
    
    // Show Loading Overlay
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/generate-profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Render Card in Preview
            renderPreviewCard(result.profile);
            showToast("Profile card generated and saved successfully!", "success");
            
            // Reset Form and selections
            profileForm.reset();
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Reload Gallery History
            await loadSavedProfiles();
        } else {
            // Backend validation errors returned
            const backendErrors = result.errors || [result.error || "Failed to generate profile."];
            backendErrors.forEach(err => showToast(err, 'error'));
        }
    } catch (err) {
        console.error('Request failed:', err);
        showToast("Server connection error. Please make sure the Flask backend is running.", "error");
    } finally {
        // Hide Loading Overlay
        loadingOverlay.classList.remove('active');
        submitBtn.disabled = false;
    }
});
