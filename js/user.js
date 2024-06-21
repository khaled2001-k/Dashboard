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
  $('#content-link-1').on('click', function(event) {
      event.preventDefault(); 
      loadUsers();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  if (!userId) {
      $('#user-details').html('<p class="text-red-500">Invalid user ID.</p>');
      $('#places-container').html('');
      $('#reviews-container').html('');
      return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
      alert('You are not logged in. Redirecting to login page.');
      window.location.href = 'index.html';
      return;
  }

  $.ajax({
      url: `http://localhost:8000/users/${userId}`,
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`
      },
      success: function(response) {
          console.log('API Response:', response); 
          if (response.user && response.user.id) {
              displayUserDetails(response.user);
              populatePlaces(response.user.place);
              populateReviews(response.user.receivedReviews);
          } else {
              console.error('Unexpected response structure:', response);
              $('#user-details').html('<p class="text-red-500">Failed to load user details. Unexpected response structure.</p>');
              $('#places-container').html('');
              $('#reviews-container').html('');
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          $('#user-details').html('<p class="text-red-500">Failed to load user details.</p>');
          $('#places-container').html('');
          $('#reviews-container').html('');
          console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
      }
  });

  function displayUserDetails(user) {
      const userDetailsContainer = $('#user-details');
      const birthdate = new Date(user.birthdate).toLocaleDateString(); 
      let userDetailsHTML = `
          <div class="col-span-1">
              <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
              <p><strong>Title:</strong> ${user.first_name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone Number:</strong> ${user.phone_number}</p>
              <p><strong>Birth Date:</strong> ${birthdate}</p>
          </div>
          <div class="col-span-1">
              <p><strong>Nationality:</strong> ${user.nationality}</p>
              <p><strong>Gender:</strong> ${user.gender}</p>
              <p><strong>Bio:</strong> ${user.bio}</p>
              <p><strong>Rating:</strong> ${user.rating}</p>
              <p><strong>Role:</strong> ${user.role}</p>
          </div>`;
      userDetailsContainer.html(userDetailsHTML);
  }

  function populatePlaces(places) {
      const placesContainer = $('#places-container');
      if (places.length === 0) {
          placesContainer.html('<p>No places found.</p>');
          return;
      }

      let placesHTML = `
          <div class="overflow-x-auto">
              <table class="min-w-full bg-white">
                  <thead class="bg-gray-800 text-white">
                      <tr>
                          <th class="px-4 py-2 text-center">Place Name</th>
                          <th class="px-4 py-2 text-center">City</th>
                          <th class="px-4 py-2 text-center">Country</th>
                          <th class="px-4 py-2 text-center">Rating</th>
                          <th class="px-4 py-2 text-center">Status</th>
                          <th class="px-4 py-2 text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody>`;
      places.forEach(place => {
          placesHTML += `
                      <tr class="border-t">
                          <td class="px-4 py-2 text-center">${place.name}</td>
                          <td class="px-4 py-2 text-center">${place.city}</td>
                          <td class="px-4 py-2 text-center">${place.country}</td>
                          <td class="px-4 py-2 text-center">${place.rating}</td>
                          <td class="px-4 py-2 text-center">${place.status}</td>
                          <td class="px-4 py-2 text-center">
                              ${place.status === 'PENDING' ? `<button class="approve-btn text-green-500" data-id="${place.id}">
                                  <i class="fas fa-check-circle"></i>
                              </button>` : ''}
                              <button class="view-place-btn text-blue-500" data-id="${place.id}">
                                  <i class="fas fa-eye"></i>
                              </button>
                          </td>
                      </tr>`;
      });
      placesHTML += `
                  </tbody>
              </table>
          </div>`;
      placesContainer.html(placesHTML);

      $('.approve-btn').on('click', function() {
          const placeId = $(this).data('id');
          approvePlace(placeId);
      });

      $('.view-place-btn').on('click', function() {
          const placeId = $(this).data('id');
          window.location.href = `place.html?id=${placeId}`;
      });
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
                      <p><strong>Given By:</strong> ${review.givenBy.first_name} ${review.givenBy.last_name}</p>
                      <p><strong>Rating:</strong> ${generateStars(review.rating)}</p>
                      <p><strong>Comment:</strong> ${review.comment}</p>
                      <p><strong>Date:</strong> ${new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button class="delete-review-btn text-red-500 ml-4" data-id="${review.givenBy.id}">
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
          const givenById = $(this).data('id');
          deleteReview(givenById);
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

  function approvePlace(placeId) {
      $.ajax({
          url: `http://localhost:8000/places/${placeId}/approve`,
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`
          },
          success: function(response) {
              showNotification('Place approved successfully');
              setTimeout(function() {
                  location.reload();
              }, 2000);
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error details:', textStatus, errorThrown, jqXHR.responseText);
              showNotification('Failed to approve place. Please try again.', 'bg-red-500');
          }
      });
  }

  function deleteReview(givenById) {
      $.ajax({
          url: `http://localhost:8000/users/${userId}/reviews`,
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          data: JSON.stringify({
              givenById: givenById
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
