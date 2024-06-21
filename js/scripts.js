$(document).ready(function() {
    $('#login-form').on('submit', function(event) {
        event.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();
      
        $.ajax({
            url: 'http://localhost:8000/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: function(response) {
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    showNotification('Login successful!');
                    setTimeout(function() {
                        const currentPath = window.location.pathname;
                        const newPath = currentPath.replace(/\/[^\/]*$/, '/html/dashboard.html');
                        window.location.href = window.location.origin + newPath;
                    }, 2000);
                } else {
                    showNotification('Login successful, but no token received.', 'bg-yellow-500');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Login failed. Please try again.', 'bg-red-500');
            }
        });
    });

    function showNotification(message, bgColorClass = 'bg-green-500') {
        const notification = $('#notification');
        notification.text(message)
            .removeClass()
            .addClass(`fixed top-5 right-0 text-white p-4 rounded shadow-md transition-transform transform translate-x-0 opacity-100 ${bgColorClass}`);
        setTimeout(() => {
            notification.addClass('translate-x-full opacity-0')
        }, 2000);
    }
});
