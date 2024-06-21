$(document).ready(function() {
    $('#dashboard-link').on('click', function() {
        window.location.href = 'dashboard.html';
    });
    function checkToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../index.html';
        }
    }

    checkToken(); 
    loadSkills();

    $('#create-skill-form').on('submit', function(event) {
        event.preventDefault();
        createSkill();
    });

    function loadSkills() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/skills',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                populateTable(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#table-container').html('<h2 class="text-2xl font-bold mb-4">Skills</h2><p class="text-red-500">Failed to load skills.</p>');
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
            }
        });
    }

    function populateTable(skills) {
        const tableContainer = $('#table-container');
        let tableHTML = `
            <h2 class="text-2xl font-bold mb-4">Skills</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-800 text-white">
                        <tr>
                            <th class="px-4 py-2 text-center">Skill Name</th>
                            <th class="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;
        skills.forEach(skill => {
            tableHTML += `
                        <tr class="border-t">
                            <td class="px-4 py-2 text-center">${skill.name}</td>
                            <td class="px-4 py-2 text-center">
                                <button class="delete-skill-btn text-red-500" data-id="${skill.id}">
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

        $('.delete-skill-btn').on('click', function() {
            const skillId = $(this).data('id');
            deleteSkill(skillId);
        });
    }

    function createSkill() {
        const token = localStorage.getItem('authToken');
        const skillName = $('#skill-name').val();
        if (!token || !skillName) {
            alert('Please enter a skill name.');
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/skills',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ name: skillName }),
            success: function(response) {
                showNotification('Skill created successfully');
                $('#skill-name').val('');
                loadSkills();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to create skill. Please try again.', 'bg-red-500');
            }
        });
    }

    function deleteSkill(skillId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: `http://localhost:8000/skills/${skillId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                showNotification('Skill deleted successfully');
                loadSkills();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to delete skill. Please try again.', 'bg-red-500');
            }
        });
    }
});
