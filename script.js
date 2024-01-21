let currentPage = 1;
const perPage = 10;

function fetchUserAndRepositories() {
  const username = $("#username").val();
  const repositoriesContainer = $("#repositories");
  const loader = $("#loader");
  const header = $("#header");
  const bar=$('#bar');

  // Disable input and button during loading
  bar.hide();
  // Clear previous repositories and user information
  repositoriesContainer.empty();
  header.empty();

  // Show loader
  loader.show();

  // Fetch user information from GitHub API
  fetch(`https://api.github.com/users/${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user information (${response.status})`
        );
      }
      return response.json();
    })
    .then((userData) => {
      // Hide loader
      loader.hide();

      // Display user information in the header
      displayUserInfoInHeader(userData);
      changeHeaderBackgroundColor();

      // Fetch repositories from GitHub API using fetch
      fetchRepositories(
        username,
        repositoriesContainer,
        loader,
        perPage,
        currentPage
      );

      // Enable input and button after loading

      // Add pagination buttons
      const totalRepos=userData.public_repos;
      addPaginationButtons(username, repositoriesContainer, loader, perPage,totalRepos);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);

      // Handle error and display a message to the user
      throw new Error('Someting went wrong');
    });
}


function fetchRepositories(username, container, loader, perPage, page) {
  // Fetch repositories from GitHub API with pagination
  fetch(
    `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch repositories (${response.status})`);
      }
      return response.json();
    })
    .then((repositories) => {
      // Hide loader
      loader.hide();

      // Display repositories using jQuery
      repositories.forEach((repository) => {
        const repositoryElement = $('<div class="repository">');
        repositoryElement.html(`
          <h3>${repository.name}</h3>
          <p class="description">${
            repository.description || "No description available."
          }</p>
          <p class="topics">${
            repository.topics
              .map((topic) => `<span class="tag">${topic}</span>`)
              .join(" ") ||
            '<span class="no-topic-available">No topic Available</span>'
          }</p>
        `);
        container.append(repositoryElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error);
      throw new Error('Something went wrong')
    });
}

function addPaginationButtons(
  username,
  container,
  loader,
  perPage,
  totalRepos
) {
  const paginationContainer = $("<div class='pagination'>");

  const totalPages = Math.ceil(totalRepos / perPage);
  const maxPagesToShow = 9;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  startPage = Math.max(1, endPage - maxPagesToShow + 1);

  const prevButton = $("<button class='prev-button'>&lt; Previous</button>").on(
    "click",
    () => {
      if (currentPage > 1) {
        currentPage--;
        loader.show();
        container.empty();
        fetchRepositories(username, container, loader, perPage, currentPage);
        paginationContainer.empty();
        addPaginationButtons(username, container, loader, perPage, totalRepos);
      }
    }
  );

  paginationContainer.append(prevButton);

for (let i = startPage; i <= endPage; i++) {
  const pageButton = $(`<button class='page-button'>${i}</button>`).on(
    "click",
    () => {
      if (currentPage !== i) {
        currentPage = i;
        loader.show();
        container.empty();
        fetchRepositories(username, container, loader, perPage, currentPage);
        paginationContainer.empty();
        addPaginationButtons(username, container, loader, perPage, totalRepos);
      }
    }
  );

  // Disable the button if it represents the current page
  pageButton.prop("disabled", i === currentPage);

  paginationContainer.append(pageButton);
}

  const nextButton = $("<button class='next-button'>Next &gt;</button>").on(
    "click",
    () => {
      if (currentPage < totalPages) {
        currentPage++;
        loader.show();
        container.empty();
        fetchRepositories(username, container, loader, perPage, currentPage);
        paginationContainer.empty();
        addPaginationButtons(username, container, loader, perPage, totalRepos);
      }
    }
  );

  paginationContainer.append(nextButton);

  container.after(paginationContainer);
}

function displayUserInfoInHeader(userData) {
  const header = $("#header");

  if (userData) {
    const userImage = userData.avatar_url;
    const userName = userData.login;
    const bio = userData.bio || "Bio not specified";
    const location = userData.location || "Location not specified";
    const twitter = userData.twitter_username || "Twitter not spcified";
    const headerHTML = `
      <div class="user-info">
        <div class="left-grid">
            <div class="user-image-container">
                <img src="${userImage}" alt="${userName}'s Profile Image" class="user-image">
            </div>
            <span class="link">
                <img src="assets/link-logo.png" alt="link-logo" class="link-logo"/>
                <a href="https://github.com/${userName}" target="_blank">https://github.com/${userName}</a>
            </span>
        </div>
        <div class="right-grid">
            <h1>${userName}</h1>
            <p>${bio}</p>
            <span class="location">
                <p><img src="assets/location-logo.png" alt="location-logo" class="location-logo"/> ${location}</p>
            </span>
            <p>Twitter: ${twitter}</p>
        </div>
      </div>
    `;
    header.html(headerHTML);
  }
}

function changeHeaderBackgroundColor() {
  const header = $("header");
  header.removeClass("present-color");
  header.addClass("header-with-bg-color");
}
