const urlLimited = `https://remotive.com/api/remote-jobs?limit=100`;
const urlCategories = `https://remotive.com/api/remote-jobs/categories`;
const board = document.querySelector('#board');
const dropdown = document.querySelector('#dropdown');
const spinner = document.querySelector('#spinner');
const searchInput = document.querySelector('#searchInput');

let jobs;
let categories;

async function getJobs(url = urlLimited) {
    try {
        const responseJobsLimited = await fetch(url);
        const data = await responseJobsLimited.json();
        const responseCategories = await fetch(urlCategories);
        categories = await responseCategories.json();
        categories = categories.jobs;
        jobs = data.jobs;
        console.log(data);
        console.log(jobs);
        console.log(categories);
        buildCards();
        buildDropdown();
    } catch(error) {
        console.log(error);
    }
}

async function getData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    } catch(error) {
        console.log(error);
    }
}

function buildCards(jobList = jobs) {
    savedJobsID = JSON.parse(localStorage.getItem('savedJobs')) || [];
    board.innerHTML = '';
    jobList.forEach((job) => {
        isJobSaved = savedJobsID.includes(job.id);
        board.innerHTML += `
        <div class="col">
        <div class="card" style="width: 25rem; background-color: blue-sky">
            <div class="card-header" style="text-align: center">
                Company: <span style="font-weight: bold">${job.company_name}</span>
            </div>
            <div class="card-body">
                <img class="card-img" src="${job.company_logo}" alt="Card image cap" alt"..." style="width: 44%; margin-left: 28%; padding: 2%; padding-bottom: 5%">
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
                            ${job.candidate_required_location
                            }
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
                    <button type="button" class="btn btn-danger" onclick="${isJobSaved ? `removeJob(this, ${job.id})">Remove this job` : `saveJob(this, ${job.id})">save this job`}</button>
                    <button type="button" class="btn btn-success" onclick="">See this job</button>
                </div>
            </div>
        </div>`;
        setTimeout(() => {}, 5);
    });
}

function saveJob(button, jobId) {
    button.onclick = function () {removeJob(button, jobId);};
    button.innerHTML = 'Remove this job';
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
    console.log(updatedJobsList, jobId);
    localStorage.setItem('savedJobs', JSON.stringify(updatedJobsList));
}

function showLocalStorage() {
    const savedJobs = jobs.filter(job => localStorage.getItem('savedJobs').includes(job.id));
    buildCards(savedJobs);
}

function showCategory(category) {
    console.log(category);
    const categoryJobs = jobs.filter(job => job.category == category);
    console.log(categoryJobs, jobs);
    buildCards(categoryJobs); 
}

function buildDropdown() {
    categories = categories.map((category) => category.name);
    dropdown.innerHTML = '';
    categories.forEach(category => dropdown.innerHTML += 
        `<button class="dropdown-item" type="button" onclick="showCategory('${category}')">${category}</button>`)
    console.log(categories);
}


getJobs();