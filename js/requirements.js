$(document).ready(function() {
    $('#dashboard-link').on('click', function() {
        window.location.href = 'dashboard.html';
    });

    loadRequirements();

    $('#create-requirement-form').on('submit', function(event) {
        event.preventDefault();
        createRequirement();
    });
    function checkToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../index.html'; 
        }
    }

    checkToken(); 
    function loadRequirements() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/requirements',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                populateTable(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#table-container').html('<h2 class="text-2xl font-bold mb-4">Requirements</h2><p class="text-red-500">Failed to load requirements.</p>');
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
            }
        });
    }

    function populateTable(requirements) {
        const tableContainer = $('#table-container');
        let tableHTML = `
            <h2 class="text-2xl font-bold mb-4">Requirements</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-800 text-white">
                        <tr>
                            <th class="px-4 py-2 text-center">Requirement Name</th>
                            <th class="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;
        requirements.forEach(requirement => {
            tableHTML += `
                        <tr class="border-t">
                            <td class="px-4 py-2 text-center">${requirement.name}</td>
                            <td class="px-4 py-2 text-center">
                                <button class="delete-requirement-btn text-red-500" data-id="${requirement.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>`;
        });
        tableHTML += `
                    </tbody>
                </table>
            </div>`;
        tableContainer.html(tableHTML);

        $('.delete-requirement-btn').on('click', function() {
            const requirementId = $(this).data('id');
            deleteRequirement(requirementId);
        });
    }

    function createRequirement() {
        const token = localStorage.getItem('authToken');
        const requirementName = $('#requirement-name').val();
        if (!token || !requirementName) {
            alert('Please enter a requirement name.');
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/requirements',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ name: requirementName }),
            success: function(response) {
                showNotification('Requirement created successfully');
                $('#requirement-name').val('');
                loadRequirements();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to create requirement. Please try again.', 'bg-red-500');
            }
        });
    }

    function deleteRequirement(requirementId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: `http://localhost:8000/requirements/${requirementId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                showNotification('Requirement deleted successfully');
                loadRequirements();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to delete requirement. Please try again.', 'bg-red-500');
            }
        });
    }
});
