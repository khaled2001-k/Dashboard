$(document).ready(function() {
    $('#dashboard-link').on('click', function() {
        window.location.href = 'dashboard.html';
    });

    loadOffers();

    $('#create-offer-form').on('submit', function(event) {
        event.preventDefault();
        createOffer();
    });

    function checkToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../index.html'; 
        }
    }

    checkToken(); 
    function loadOffers() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/offers',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                populateTable(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#table-container').html('<h2 class="text-2xl font-bold mb-4">Offers</h2><p class="text-red-500">Failed to load offers.</p>');
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
            }
        });
    }

    function populateTable(offers) {
        const tableContainer = $('#table-container');
        let tableHTML = `
            <h2 class="text-2xl font-bold mb-4">Offers</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-800 text-white">
                        <tr>
                            <th class="px-4 py-2 text-center">Offer Name</th>
                            <th class="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;
        offers.forEach(offer => {
            tableHTML += `
                        <tr class="border-t">
                            <td class="px-4 py-2 text-center">${offer.name}</td>
                            <td class="px-4 py-2 text-center">
                                <button class="delete-offer-btn text-red-500" data-id="${offer.id}">
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

        $('.delete-offer-btn').on('click', function() {
            const offerId = $(this).data('id');
            deleteOffer(offerId);
        });
    }

    function createOffer() {
        const token = localStorage.getItem('authToken');
        const offerName = $('#offer-name').val();
        if (!token || !offerName) {
            alert('Please enter an offer name.');
            return;
        }

        $.ajax({
            url: 'http://localhost:8000/offers',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ name: offerName }),
            success: function(response) {
                showNotification('Offer created successfully');
                $('#offer-name').val('');
                loadOffers();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to create offer. Please try again.', 'bg-red-500');
            }
        });
    }

    function deleteOffer(offerId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
            return;
        }

        $.ajax({
            url: `http://localhost:8000/offers/${offerId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                showNotification('Offer deleted successfully');
                loadOffers();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to delete offer. Please try again.', 'bg-red-500');
            }
        });
    }
});
