const mainAPI = `https://remotive.com/api/remote-jobs`;
const countriesAPI = "https://restcountries.com/v3.1/all";
const urlLimited = `https://remotive.com/api/remote-jobs?limit=100`;
const urlCategories = `https://remotive.com/api/remote-jobs/categories`;

const board = document.querySelector('#board');
const dropdown = document.querySelector('#dropdown');
const spinner = document.querySelector('#spinner');
const searchInput = document.querySelector('#searchInput');
const currentResults = document.querySelector('#currentResults');

let jobs;
let allJobs;
let categories;
let categoriesJobs;
let countries;
const resultsLimit = 20;
let ShowingLocalStorage = false;
let currentFilter = 'all jobs';



async function main() {
    await getCountries();
    buildDropdown();
    showAllJobs();
}

// Gets an API and returns its data
async function getData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data);
        return data;
    } catch(error) {
        console.log(error);
    }
}

// Adds an endpoint to the main API
function setEndpoint(endPoint) {
    return mainAPI + endPoint
}

// Sets a URL that filters according to a given category
function categoryFilteredAPI(category, limit=0) {
    let endPoint = `?category=${category}`;
    if(limit) {
        endPoint += `&limit=${limit}`;
    }
    return setEndpoint(endPoint);
}

function buildCards(jobList = jobs) {
    // Gets an array of jobs objects, 
    // Builds a card for each job,
    // Determine the state of the button whther to remove if in localStorage or save if not.
    scrollTo(0, 0);
    currentResults.textContent = `${jobList.length} results from ${currentFilter}`
    spinner.style.display = 'none';
    savedJobsID = JSON.parse(localStorage.getItem('savedJobs')) || [];
    board.innerHTML = '';
    jobList.forEach((job) => {
        let logo = job.company_logo;
        let location = job.candidate_required_location;
        location == 'USA' ? location = 'United States' : location;
        const country = countries.filter(country => country.name.common.includes(location) || country.name.official.includes(location));
        isJobSaved = savedJobsID.includes(job.id);
        board.innerHTML += `
        <div class="col">
        <div class="card" style="width: 25rem; background-color: blue-sky">
            <div class="card-header" style="text-align: center">
                Company: <span style="font-weight: bold">${job.company_name}</span>
            </div>
            <div class="card-body">
                <img class="card-img" src="${logo}" alt="..." onerror="this.src='LogoNotFound.png'" style="width: 44%; margin-left: 28%; padding: 2%; padding-bottom: 5%">
                <div class="form-control" style="height: 150px; overflow-y: scroll;">
                    <p class="card-title">${job.description}</p>
                </div>
                    <dl>
                        <dt>Salary</dt>
                        <dd class="card-text">
                            ${job.salary ? job.salary: '?'}
                        </dd>
                        <dt>Candidate required location
                        </dt>
                        <dd class="card-text">
                            ${job.candidate_required_location}
                            ${country.length > 0 ? `<img src="${country[country.length - 1].flags.svg}" class="card-img" alt="..." style="width: 70px">` : ''}
                        </dd>
                        <dt>Category</dt>
                        <dd class="card-text">
                            ${job.category}
                        </dd>
                        <dt>ID</dt>
                        <dd class="card-text">
                            ${job.id}
                        </dd>
                    </dl>       
                </div>
                <div style="display: flex; justify-content: space-around; padding: 4%">
                    <button type="button" class="btn btn-danger btn-lg" onclick="${isJobSaved ? `removeJob(this, ${job.id})">Remove this job ♡` : `saveJob(this, ${job.id})">save this job`}</button>
                    <a href="${job.url}" target="_blank" type="button" class="btn btn-success btn-lg" onclick="">See this job</a>
                </div>
                <p style="text-align: center; background-color: skyblue; padding: 2%">Type:     <span style="font-weight: bold;">${job.job_type}</span></p>
            </div>
        </div>`;
        setTimeout(() => {}, 5);
    });
}

function saveJob(button, jobId) {
    button.onclick = function () {removeJob(button, jobId);};
    button.innerHTML = 'Remove this job ♡';
    let savedJobsList = JSON.parse(localStorage.getItem('savedJobs')) || [];
    if (!savedJobsList.includes(jobId)) {
        savedJobsList.push(jobId);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobsList));
    }
}

function removeJob(button, jobId) {
    button.onclick = function () {saveJob(button, jobId);};
    button.innerHTML = 'Save this job';
    let savedJobsList = JSON.parse(localStorage.getItem('savedJobs'));
    let updatedJobsList = savedJobsList.filter(item => item != jobId);
    localStorage.setItem('savedJobs', JSON.stringify(updatedJobsList));
    if (ShowingLocalStorage) {
        showLocalStorage();
    }
}

async function showLocalStorage() {
    currentFilter = 'saved jobs'
    spinner.style.display = 'block';
    allJobs = allJobs || await getData(mainAPI);
    const savedJobs = allJobs.jobs.filter(job => localStorage.getItem('savedJobs').includes(job.id));
    buildCards(savedJobs);
    ShowingLocalStorage = true;
}

async function showCategory(category, limit=resultsLimit) {
    currentFilter = `${category} category`
    spinner.style.display = 'block';
    const categoryJobs = await getData(categoryFilteredAPI(category, limit));
    buildCards(categoryJobs.jobs); 
    ShowingLocalStorage = false;
}

async function showAllJobs(limit=resultsLimit) {
    currentFilter = `all jobs`;
    spinner.style.display = 'block';
    jobs = jobs || await getData(setEndpoint(`?limit=${limit}`));
    buildCards(jobs.jobs);
    ShowingLocalStorage = false;
}

async function showSearch(limit=resultsLimit) {
    const search = searchInput.value;
    currentFilter = `search ${search}`;
    console.log(currentFilter, search, 'Wow');
    spinner.style.display = 'block';
    let endpoint = `?search=${search}`;
    limit ? endpoint += `&limit=${limit}`: endpoint;
    let jobsSearch = await getData(setEndpoint(endpoint));
    buildCards(jobsSearch);
    ShowingLocalStorage = false;
}

// Build the dropdown that shows all the buttons to choose a category
async function buildDropdown() {
    categories = await getData(setEndpoint('/categories'));
    categories = categories.jobs;
    categories = categories.map((category) => category.name);
    dropdown.innerHTML = '';
    categories.forEach(category => dropdown.innerHTML += 
        `<button class="dropdown-item" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" onclick="showCategory('${category}')">${category}</button>`)
}

async function getCountries() {
    countries = await getData(countriesAPI) || [];
}

function showHome() {
    board.innerHTML = `<h1>Welcome to our jobs search service</h1>
    <h2>All you need for using our search is a good heart and a little bit mind...</h2>`
}

main();