import { apiRequest, getSession, isAuthenticated, showToast, unwrapResponse } from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const session = getSession();
    const userId = session.userId || session.UserId;

    // UI Elements
    const headerUserName = document.getElementById('headerUserName');
    const headerAvatar = document.getElementById('headerAvatar');
    const profileFullName = document.getElementById('profileFullName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileForm = document.getElementById('profileForm');
    const passportPreview = document.getElementById('passportPreview');
    const toast = document.getElementById('toast');

    // Tab Switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Logic for other tabs could go here
            if (tab.dataset.tab !== 'profile') {
                showToast(`Раздел "${tab.textContent}" в разработке`);
            }
        });
    });

    // Helper to update toast
    function localShowToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Load User Data
    async function loadUserData() {
        try {
            const response = unwrapResponse(await apiRequest('/api/User/me', { auth: true }));
            const user = response.data;

            if (user) {
                const fullName = `${user.firstName} ${user.lastName}`;
                headerUserName.textContent = fullName;
                profileFullName.textContent = fullName;
                profileEmail.textContent = user.email;
                
                // Form fields
                profileForm.firstName.value = user.firstName || '';
                profileForm.lastName.value = user.lastName || '';
                profileForm.phone.value = user.phone || '';
                profileForm.email.value = user.email || '';
                
                if (user.passportNumber) {
                    passportPreview.textContent = user.passportNumber;
                }

                // Avatars
                const avatarUrl = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2563eb&color=fff`;
                headerAvatar.src = avatarUrl;
                profileAvatar.src = avatarUrl;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            localShowToast('Ошибка загрузки данных профиля');
        }
    }

    // Handle Form Submit
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = profileForm.querySelector('.save-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Сохранение...';

        const updatedData = {
            id: userId,
            firstName: profileForm.firstName.value.trim(),
            lastName: profileForm.lastName.value.trim(),
            phone: profileForm.phone.value.trim()
        };

        try {
            const response = unwrapResponse(await apiRequest(`/api/User/${userId}`, {
                method: 'PUT',
                auth: true,
                body: updatedData
            }));

            localShowToast('Профиль успешно обновлен');
            await loadUserData(); // Refresh UI
        } catch (error) {
            console.error('Failed to update profile:', error);
            localShowToast(error.message || 'Ошибка обновления профиля');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Сохранить изменения';
        }
    });

    // Initialize
    await loadUserData();
});
