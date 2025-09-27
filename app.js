// Patient data from JSON
const patientData = {
    patientName: "Arjun Patel",
    age: 34,
    prakriti: "Vata-Pitta",
    currentTherapy: "Panchakarma Detox Program",
    progress: 65,
    nextAppointment: "2025-09-16T11:00:00",
    therapist: "Dr. Meera Sharma",
    phone: "+91 98765 43210",
    email: "arjun.patel@email.com",
    daysInTreatment: 12,
    totalDuration: 21,
    completedSessions: 8,
    totalSessions: 14,
    upcomingReminders: [
        "Take herbal medicine before breakfast",
        "Oil massage at 6 PM today",
        "Avoid cold foods until treatment completes"
    ],
    recentProgress: [
        { date: "Sep 10", mood: 8, energy: 7, digestion: 9 },
        { date: "Sep 11", mood: 8, energy: 8, digestion: 8 },
        { date: "Sep 12", mood: 9, energy: 8, digestion: 9 },
        { date: "Sep 13", mood: 9, energy: 9, digestion: 9 }
    ],
    therapyHistory: [
        { name: "Initial Consultation", date: "September 2, 2025", status: "Completed", type: "assessment" },
        { name: "Abhyanga Massage", date: "September 4, 2025", status: "Completed", type: "therapy" },
        { name: "Swedana (Steam Therapy)", date: "September 6, 2025", status: "Completed", type: "therapy" },
        { name: "Virechana Preparation", date: "September 8, 2025", status: "Completed", type: "therapy" },
        { name: "Panchakarma Day 1", date: "September 10, 2025", status: "Completed", type: "maintreatment" },
        { name: "Follow-up Session", date: "September 16, 2025", status: "Scheduled", type: "followup" }
    ],
    doshaBalance: { vata: 60, pitta: 35, kapha: 25 },
    vitalStats: {
        weight: "72 kg",
        bloodPressure: "120/80",
        pulseRate: "72 bpm",
        lastUpdated: "September 13, 2025"
    }
};

// Global state
let currentView = 'dashboard';
let currentMonth = new Date();
let notificationsPanelOpen = false;
let progressChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('AyurSutra Patient Portal initializing...');
    initializeApp();
    setupEventListeners();
    updateDashboard();
    console.log('Patient portal initialized successfully');
});

function initializeApp() {
    // Show dashboard by default
    showView('dashboard');
    
    // Initialize circular progress
    initializeCircularProgress();
    
    // Initialize calendar
    generateCalendar();
    
    // Set form date limits
    setFormDateLimits();
    
    // Initialize care guide tabs
    initializeCareGuideTabs();
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Direct navigation event listeners for each nav item
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(navItem => {
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const viewName = this.getAttribute('data-view');
            console.log('Navigation clicked:', viewName);
            showView(viewName);
        });
    });
    
    // Direct action button event listeners
    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            console.log('Action clicked:', action);
            handleAction(action, this);
        });
    });
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(tabBtn => {
        tabBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this);
        });
    });
    
    // Calendar navigation
    document.addEventListener('click', function(e) {
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && !calendarDay.classList.contains('other-month')) {
            selectCalendarDate(calendarDay);
        }
    });
    
    // Form submissions
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Message input
    const messageInput = document.querySelector('.message-input .form-control');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
    
    // Logo click to return to dashboard
    const logoSection = document.querySelector('.logo-section');
    if (logoSection) {
        logoSection.style.cursor = 'pointer';
        logoSection.addEventListener('click', () => showView('dashboard'));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Close modal/panel on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            if (notificationsPanelOpen) {
                toggleNotifications();
            }
        }
    });
    
    // Click outside modal to close
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    console.log('Event listeners setup complete');
}

// Navigation functions
function showView(viewName) {
    console.log('Showing view:', viewName);
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-view="${viewName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
        activeView.classList.add('active');
        currentView = viewName;
        
        // Trigger view-specific updates
        setTimeout(() => {
            switch(viewName) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'therapies':
                    updateTherapiesView();
                    break;
                case 'appointments':
                    updateAppointmentsView();
                    break;
                case 'profile':
                    updateProfileView();
                    break;
                case 'care-guide':
                    updateCareGuideView();
                    break;
                case 'progress':
                    updateProgressView();
                    break;
                case 'messages':
                    updateMessagesView();
                    break;
            }
        }, 100);
        
        // Scroll to top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        
        showToast(`Navigated to ${viewName.replace('-', ' ')} view`, 'info');
        console.log('Successfully navigated to:', viewName);
    } else {
        console.error('View not found:', `${viewName}-view`);
    }
}

// Action handler
function handleAction(action, button) {
    console.log('Handling action:', action);
    
    switch(action) {
        case 'toggle-notifications':
            toggleNotifications();
            break;
        case 'emergency-contact':
            handleEmergencyContact();
            break;
        case 'reschedule':
            openBookingModal('reschedule');
            break;
        case 'book-appointment':
            openBookingModal('book');
            break;
        case 'prev-month':
            navigateCalendar(-1);
            break;
        case 'next-month':
            navigateCalendar(1);
            break;
        case 'close-notifications':
            toggleNotifications();
            break;
        case 'close-modal':
            closeModal();
            break;
        case 'new-message':
            focusMessageInput();
            break;
        case 'send-message':
            handleSendMessage();
            break;
        default:
            console.warn('Unknown action:', action);
            showToast('Action not implemented yet', 'warning');
    }
}

// Dashboard functions
function updateDashboard() {
    console.log('Updating dashboard...');
    
    // Update circular progress
    updateCircularProgress();
    
    // Update appointment info
    updateNextAppointmentInfo();
    
    // Update wellness metrics
    updateWellnessMetrics();
    
    // Update reminders
    updateReminders();
    
    console.log('Dashboard updated');
}

function initializeCircularProgress() {
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        progressCircle.style.setProperty('--progress', patientData.progress);
    }
}

function updateCircularProgress() {
    const progressText = document.querySelector('.progress-text');
    const progressDetails = document.querySelectorAll('.detail-item .value');
    
    if (progressText) {
        progressText.textContent = `${patientData.progress}%`;
    }
    
    if (progressDetails.length >= 2) {
        progressDetails[0].textContent = `${patientData.daysInTreatment} of ${patientData.totalDuration}`;
        progressDetails[1].textContent = `${patientData.completedSessions} of ${patientData.totalSessions}`;
    }
}

function updateNextAppointmentInfo() {
    const dateElement = document.querySelector('.appointment-info .date');
    const timeElement = document.querySelector('.appointment-info .time');
    const therapistElement = document.querySelector('.appointment-info .therapist');
    
    const appointmentDate = new Date(patientData.nextAppointment);
    
    if (dateElement && !isNaN(appointmentDate.getTime())) {
        dateElement.textContent = appointmentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
    
    if (timeElement && !isNaN(appointmentDate.getTime())) {
        timeElement.textContent = appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    if (therapistElement) {
        therapistElement.textContent = `with ${patientData.therapist}`;
    }
}

function updateWellnessMetrics() {
    const latestProgress = patientData.recentProgress[patientData.recentProgress.length - 1];
    const metrics = document.querySelectorAll('.metric');
    
    if (metrics.length >= 3 && latestProgress) {
        updateStars(metrics[0], latestProgress.mood);
        updateStars(metrics[1], latestProgress.energy);
        updateStars(metrics[2], latestProgress.digestion);
    }
}

function updateStars(metricElement, rating) {
    const starsContainer = metricElement.querySelector('.rating-stars');
    if (!starsContainer) return;
    
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

function updateReminders() {
    const reminderList = document.querySelector('.reminder-list');
    if (reminderList && patientData.upcomingReminders) {
        reminderList.innerHTML = '';
        
        patientData.upcomingReminders.forEach(reminder => {
            const reminderItem = document.createElement('div');
            reminderItem.className = 'reminder-item';
            
            let icon = 'fas fa-bell';
            if (reminder.includes('medicine')) icon = 'fas fa-pills';
            if (reminder.includes('massage')) icon = 'fas fa-hand-sparkles';
            if (reminder.includes('cold')) icon = 'fas fa-snowflake';
            
            reminderItem.innerHTML = `
                <i class="${icon}"></i>
                <span>${reminder}</span>
            `;
            
            reminderList.appendChild(reminderItem);
        });
    }
}

// Therapies view
function updateTherapiesView() {
    console.log('Therapies view loaded');
}

// Appointments view
function updateAppointmentsView() {
    generateCalendar();
    console.log('Appointments view loaded');
}

function generateCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.getElementById('calendar-month');
    
    if (!calendarDays || !calendarMonth) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Update month display
    calendarMonth.textContent = currentMonth.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear existing days
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        // Add classes for styling
        if (date.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday(date)) {
            dayElement.classList.add('today');
        }
        
        if (hasAppointment(date)) {
            dayElement.classList.add('has-appointment');
        }
        
        dayElement.setAttribute('data-date', date.toISOString().split('T')[0]);
        calendarDays.appendChild(dayElement);
    }
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function hasAppointment(date) {
    const appointmentDate = new Date(patientData.nextAppointment);
    return date.toDateString() === appointmentDate.toDateString();
}

function navigateCalendar(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    generateCalendar();
    
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
        calendarContainer.style.transform = `translateX(${direction * 20}px)`;
        calendarContainer.style.opacity = '0.7';
        
        setTimeout(() => {
            calendarContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            calendarContainer.style.transform = 'translateX(0)';
            calendarContainer.style.opacity = '1';
        }, 100);
    }
}

function selectCalendarDate(dayElement) {
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    dayElement.classList.add('selected');
    
    const hasAppointment = dayElement.classList.contains('has-appointment');
    if (hasAppointment) {
        showToast('You have an appointment on this date', 'info');
    } else {
        const date = dayElement.getAttribute('data-date');
        showToast(`Selected: ${new Date(date).toLocaleDateString()}`, 'info');
    }
}

// Profile view
function updateProfileView() {
    updateDoshaChart();
    updateVitalStats();
    console.log('Profile view loaded');
}

function updateDoshaChart() {
    const doshaItems = document.querySelectorAll('.dosha-item');
    const doshaValues = [patientData.doshaBalance.vata, patientData.doshaBalance.pitta, patientData.doshaBalance.kapha];
    
    doshaItems.forEach((item, index) => {
        const fill = item.querySelector('.dosha-fill');
        const percentage = item.querySelector('.dosha-percentage');
        
        if (fill && percentage && doshaValues[index] !== undefined) {
            setTimeout(() => {
                fill.style.width = `${doshaValues[index]}%`;
                percentage.textContent = `${doshaValues[index]}%`;
            }, 200 * index);
        }
    });
}

function updateVitalStats() {
    const vitalItems = document.querySelectorAll('.vital-item');
    const vitalData = [
        patientData.vitalStats.weight,
        patientData.vitalStats.bloodPressure,
        patientData.vitalStats.pulseRate
    ];
    
    vitalItems.forEach((item, index) => {
        const value = item.querySelector('.vital-value');
        if (value && vitalData[index]) {
            value.textContent = vitalData[index];
        }
    });
}

// Care guide functions
function updateCareGuideView() {
    console.log('Care guide view loaded');
}

function initializeCareGuideTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0 && tabPanes.length > 0) {
        tabButtons[0].classList.add('active');
        tabPanes[0].classList.add('active');
    }
}

function switchTab(tabButton) {
    const tabName = tabButton.getAttribute('data-tab');
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabButton.classList.add('active');
    
    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    const targetPane = document.getElementById(tabName);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    showToast(`Switched to ${tabName} dietary guide`, 'info');
}

// Progress view
function updateProgressView() {
    console.log('Progress view updating...');
    setTimeout(() => {
        initializeProgressChart();
    }, 200);
}

function initializeProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) {
        console.error('Progress chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    if (progressChart) {
        progressChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: patientData.recentProgress.map(item => item.date),
            datasets: [
                {
                    label: 'Mood',
                    data: patientData.recentProgress.map(item => item.mood),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Energy',
                    data: patientData.recentProgress.map(item => item.energy),
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Digestion',
                    data: patientData.recentProgress.map(item => item.digestion),
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(45, 110, 62, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    console.log('Progress chart initialized');
}

// Messages view
function updateMessagesView() {
    scrollMessagesToBottom();
    console.log('Messages view loaded');
}

function scrollMessagesToBottom() {
    const messageThread = document.querySelector('.message-thread');
    if (messageThread) {
        setTimeout(() => {
            messageThread.scrollTop = messageThread.scrollHeight;
        }, 100);
    }
}

function focusMessageInput() {
    const messageInput = document.querySelector('.message-input .form-control');
    if (messageInput) {
        messageInput.focus();
    }
}

function handleSendMessage() {
    const input = document.querySelector('.message-input .form-control');
    if (!input || !input.value.trim()) return;
    
    const messageText = input.value.trim();
    
    addMessageToThread(messageText, true);
    input.value = '';
    
    setTimeout(() => {
        const responses = [
            "Thank you for your message. I'll review this and get back to you soon.",
            "That's great to hear! Keep up the good work with your treatment.",
            "I understand your concern. Let's discuss this during your next appointment.",
            "Please continue following the prescribed guidelines. You're doing well!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToThread(randomResponse, false);
    }, 2000);
}

function addMessageToThread(text, isSent) {
    const messageThread = document.querySelector('.message-thread');
    if (!messageThread) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    if (isSent) {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="time">${currentTime}</span>
                </div>
                <div class="message-text">${text}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">MS</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender">${patientData.therapist}</span>
                    <span class="time">${currentTime}</span>
                </div>
                <div class="message-text">${text}</div>
            </div>
        `;
    }
    
    messageThread.appendChild(messageDiv);
    scrollMessagesToBottom();
    
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
}

// Notifications
function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;
    
    notificationsPanelOpen = !notificationsPanelOpen;
    
    if (notificationsPanelOpen) {
        panel.classList.add('open');
        setTimeout(() => markNotificationsAsRead(), 2000);
        showToast('Notifications opened', 'info');
    } else {
        panel.classList.remove('open');
        showToast('Notifications closed', 'info');
    }
}

function markNotificationsAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    unreadNotifications.forEach(notification => {
        notification.classList.remove('unread');
    });
    
    const notificationCount = document.querySelector('.notification-count');
    if (notificationCount) {
        notificationCount.textContent = '0';
        notificationCount.style.display = 'none';
    }
}

// Modal functions
function openBookingModal(type = 'book') {
    const modal = document.getElementById('booking-modal');
    const modalTitle = modal.querySelector('.modal-header h3');
    
    if (modal && modalTitle) {
        modalTitle.textContent = type === 'reschedule' ? 'Reschedule Appointment' : 'Book New Session';
        modal.classList.remove('hidden');
        
        const firstInput = modal.querySelector('select, input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        showToast(`${type === 'reschedule' ? 'Reschedule' : 'Booking'} modal opened`, 'success');
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    });
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        closeModal();
        showToast('Appointment request sent successfully!', 'success');
    }, 2000);
}

// Utility functions
function handleEmergencyContact() {
    if (confirm(`Call emergency contact: ${patientData.therapist} at ${patientData.phone}?`)) {
        showToast(`Emergency contact initiated for ${patientData.therapist}`, 'success');
    }
}

function setFormDateLimits() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showView('dashboard');
                break;
            case '2':
                e.preventDefault();
                showView('therapies');
                break;
            case '3':
                e.preventDefault();
                showView('appointments');
                break;
            case '4':
                e.preventDefault();
                showView('profile');
                break;
        }
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-16);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: var(--space-12);
        min-width: 320px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const colors = {
        success: 'var(--color-ayur-primary)',
        error: 'var(--color-error)',
        warning: 'var(--color-ayur-gold)',
        info: 'var(--color-ayur-secondary)'
    };
    
    if (colors[type]) {
        toast.style.borderLeftColor = colors[type];
        toast.style.borderLeftWidth = '4px';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Add CSS animations for toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: var(--space-8);
        flex: 1;
        color: var(--color-text);
    }
    
    .toast-close {
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: var(--space-4);
        border-radius: var(--radius-sm);
        transition: color var(--duration-fast) var(--ease-standard);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }
    
    .toast-close:hover {
        color: var(--color-text);
        background: var(--color-secondary);
    }
    
    .calendar-day.selected {
        background: var(--color-ayur-accent) !important;
        color: var(--color-text) !important;
        font-weight: var(--font-weight-bold);
    }
`;
document.head.appendChild(toastStyles);

console.log('AyurSutra Patient Portal fully loaded');