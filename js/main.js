// Configuration
const GITHUB_USERNAME = 'DeVs2611'; // change if needed
const INCLUDE_FORKS = false; // toggle default
const MAX_REPOS = 100;
const GITHUB_TOKEN = ''; // optional: set a token if you want to include private repos (see README)

const projectsList = document.getElementById('projects-list');
const loader = document.getElementById('loader');
const toggleForks = document.getElementById('toggle-forks');
const sortStars = document.getElementById('sort-stars');

async function fetchRepos() {
  loader.style.display = 'block';
  projectsList.innerHTML = '';
  try {
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
    const resp = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=${MAX_REPOS}`, { headers });
    if (!resp.ok) throw new Error(`GitHub API: ${resp.status} ${resp.statusText}`);
    let repos = await resp.json();

    // Filter forks if needed
    if (!toggleForks.checked) repos = repos.filter(r => !r.fork);

    // Sort
    if (sortStars.checked) repos.sort((a,b) => b.stargazers_count - a.stargazers_count);
    else repos.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (repos.length === 0) projectsList.innerHTML = '<p class="loader">No public repositories found.</p>';

    repos.forEach(renderRepo);
  } catch (err) {
    projectsList.innerHTML = `<p class="loader">Failed to load repos: ${err.message}</p>`;
    console.error(err);
  } finally {
    loader.style.display = 'none';
  }
}

function renderRepo(repo) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
    <p>${repo.description ? escapeHtml(repo.description) : ''}</p>
    <div class="meta">
      ${repo.language ? `<span>🧭 ${repo.language}</span>` : ''}
      <span>⭐ ${repo.stargazers_count}</span>
      <span>🔱 ${repo.forks_count}</span>
    </div>
  `;
  projectsList.appendChild(card);
}

// small helper to avoid HTML injection
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

// Event bindings
toggleForks.checked = INCLUDE_FORKS;
sortStars.checked = true;

toggleForks.addEventListener('change', fetchRepos);
sortStars.addEventListener('change', fetchRepos);

// Initial load
fetchRepos();