$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');

    function checkToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../index.html'; 
        }
    }

    checkToken(); 
    if (!placeId) {
        $('#place-details').html('<p class="text-red-500">Invalid place ID.</p>');
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = 'index.html';
        return;
    }

    $.ajax({
        url: `http://localhost:8000/places/${placeId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            console.log('API Response:', response); 
            if (response.place && response.place.id) { 
                displayPlaceDetails(response.place);
                populateOpportunities(response.place.opportunities);
                populateReviews(response.place.touristReviews);
                populateMedia(response.place.placeMedia);
                initCarousel();
            } else {
                console.error('Unexpected response structure:', response);
                $('#place-details').html('<p class="text-red-500">Failed to load place details. Unexpected response structure.</p>');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#place-details').html('<p class="text-red-500">Failed to load place details.</p>');
            console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
        }
    });

    function displayPlaceDetails(place) {
        const placeDetailsContainer = $('#place-details');
        const createdAt = new Date(place.createdAt).toLocaleDateString(); 
        const updatedAt = new Date(place.updatedAt).toLocaleDateString(); 

        let placeDetailsHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Name:</strong> ${place.name}</p>
                    <p><strong>Type:</strong> ${place.type}</p>
                    <p><strong>City:</strong> ${place.city}</p>
                    <p><strong>Country:</strong> ${place.country}</p>
                </div>
                <div>
                    <p><strong>Phone Number:</strong> ${place.phone_number}</p>
                    <p><strong>Rating:</strong> ${generateStars(place.rating)}</p>
                    <p><strong>Status:</strong> ${place.status}</p>
                   
                </div>
            </div>`;
        placeDetailsContainer.html(placeDetailsHTML);
    }

    function populateMedia(media) {
        const mediaContainer = $('#carousel-inner');
        if (media.length === 0) {
            mediaContainer.html('<p>No media found.</p>');
            return;
        }

        let mediaHTML = '';
        media.forEach((url, index) => {
            mediaHTML += `
                <div class="absolute inset-0 transition-opacity duration-700 ${index === 0 ? 'opacity-100' : 'opacity-0'}">
                    <img src="${url}" alt="Place Media" class="object-cover w-full h-full">
                </div>`;
        });
        mediaContainer.html(mediaHTML);
    }

    function populateOpportunities(opportunities) {
        const opportunitiesContainer = $('#opportunities-container');
        if (opportunities.length === 0) {
            opportunitiesContainer.html('<p>No opportunities found.</p>');
            return;
        }

        let opportunitiesHTML = '';
        opportunities.forEach(opportunity => {
            const fromDate = new Date(opportunity.from).toLocaleDateString();
            const toDate = new Date(opportunity.to).toLocaleDateString();
            opportunitiesHTML += `
                <div class="border-b border-gray-200 py-2">
                    <p><strong>Title:</strong> ${opportunity.title}</p>
                    <p><strong>Description:</strong> ${opportunity.description}</p>
                    <p><strong>From:</strong> ${fromDate}</p>
                    <p><strong>To:</strong> ${toDate}</p>
                    <p><strong>Status:</strong> ${opportunity.status}</p>
                </div>`;
        });
        opportunitiesContainer.html(opportunitiesHTML);
    }

    function populateReviews(reviews) {
        const reviewsContainer = $('#reviews-container');
        if (reviews.length === 0) {
            reviewsContainer.html('<p>No reviews found.</p>');
            return;
        }

        let leftColumnHTML = '<div class="w-full md:w-1/2 pr-2">';
        let rightColumnHTML = '<div class="w-full md:w-1/2 pl-2">';
        
        reviews.forEach((review, index) => {
            const reviewHTML = `
                <div class="border-b border-gray-200 py-2 flex justify-between">
                    <div>
                        <p><strong>Tourist:</strong> ${review.tourist.first_name} ${review.tourist.last_name}</p>
                        <p><strong>Rating:</strong> ${generateStars(review.rating)}</p>
                        <p><strong>Comment:</strong> ${review.comment}</p>
                    </div>
                    <button class="delete-review-btn text-red-500 ml-4" data-id="${review.tourist.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
            
            if (index % 2 === 0) {
                leftColumnHTML += reviewHTML;
            } else {
                rightColumnHTML += reviewHTML;
            }
        });
    
        leftColumnHTML += '</div>';
        rightColumnHTML += '</div>';
    
        reviewsContainer.html(`<div class="flex flex-wrap">${leftColumnHTML}${rightColumnHTML}</div>`);

        $('.delete-review-btn').on('click', function() {
            const touristId = $(this).data('id');
            deleteReview(touristId);
        });
    }

    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-yellow-500"></i>';
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                stars += '<i class="fas fa-star-half-alt text-yellow-500"></i>';
            } else {
                stars += '<i class="far fa-star text-yellow-500"></i>';
            }
        }
        return stars;
    }

    function initCarousel() {
        const carousel = $('#carousel-inner');
        const slides = carousel.children();
        let currentIndex = 0;

        function showNextSlide() {
            slides.eq(currentIndex).removeClass('opacity-100').addClass('opacity-0');
            currentIndex = (currentIndex + 1) % slides.length;
            slides.eq(currentIndex).removeClass('opacity-0').addClass('opacity-100');
        }

        function showPrevSlide() {
            slides.eq(currentIndex).removeClass('opacity-100').addClass('opacity-0');
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            slides.eq(currentIndex).removeClass('opacity-0').addClass('opacity-100');
        }

        $('#next').on('click', showNextSlide);
        $('#prev').on('click', showPrevSlide);

        setInterval(showNextSlide, 3000); 
    }

    function deleteReview(touristId) {
        $.ajax({
            url: `http://localhost:8000/places/${placeId}/reviews`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                touristId: touristId
            }),
            success: function(response) {
                showNotification('Review deleted successfully');
                setTimeout(function() {
                    location.reload();
                }, 2000);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
                showNotification('Failed to delete review. Please try again.', 'bg-red-500');
            }
        });
    }

    function showNotification(message, bgColorClass = 'bg-green-500') {
        const notification = $('#notification');
        notification.text(message)
            .removeClass()
            .addClass(`fixed top-5 right-0 text-white p-4 rounded shadow-md transition-transform transform translate-x-0 opacity-100 ${bgColorClass}`);
        setTimeout(() => {
            notification.addClass('translate-x-full opacity-0');
        }, 2000);
    }
});
