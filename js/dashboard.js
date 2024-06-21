
$(document).ready(function() {
    $('#content-link-1').on('click', function(event) {
        event.preventDefault(); 
        loadUsers();
    });

    
    function loadUsers() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/users/',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                if (response.users && Array.isArray(response.users)) {
                    populateUserTable(response.users);
                } else {
                    console.error('Unexpected response structure:', response);
                    $('#table-container').html('<p class="text-red-500">Failed to load users. Unexpected response structure.</p>');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#content').html('<h2 class="text-2xl font-bold mb-4">Users</h2><p class="text-red-500">Failed to load users.</p>');
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
            }
        });
    }

    function populateUserTable(users) {
        const tableContainer = $('#table-container');
        let tableHTML = `
            <h2 class="text-2xl font-bold mb-4">Users</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-800 text-white">
                        <tr>
                            <th class="px-4 py-2 text-center">Name</th>
                            <th class="px-4 py-2 text-center">Email</th>
                            <th class="px-4 py-2 text-center">Phone Number</th>
                            <th class="px-4 py-2 text-center">Nationality</th>
                            <th class="px-4 py-2 text-center">Gender</th>
                            <th class="px-4 py-2 text-center">Role</th>
                            <th class="px-4 py-2 text-center">Info</th>
                        </tr>
                    </thead>
                    <tbody>`;
        users.forEach(user => {
            tableHTML += `
                        <tr class="border-t">
                            <td class="px-4 py-2 text-center">${user.last_name}</td>
                            <td class="px-4 py-2 text-center">${user.email}</td>
                            <td class="px-4 py-2 text-center">${user.phone_number}</td>
                            <td class="px-4 py-2 text-center">${user.nationality}</td>
                            <td class="px-4 py-2 text-center">${user.gender}</td>
                            <td class="px-4 py-2 text-center">${user.role}</td>
                            <td class="px-4 py-2 text-center">
                                <button class="info-btn" data-id="${user.id}">
                                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path></svg>
                                </button>
                            </td>
                        </tr>`;
        });
        tableHTML += `
                    </tbody>
                </table>
            </div>`;
        tableContainer.html(tableHTML);

        $('.info-btn').on('click', function() {
            const userId = $(this).data('id');
            window.location.href = `user.html?id=${userId}`;
        });
    }
});
