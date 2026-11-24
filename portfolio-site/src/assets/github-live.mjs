// Public project and repository metadata is published with the verified site build.
// Avoid browser-side GitHub API calls: anonymous API rate limits can produce 403
// console errors and the generated Work catalogue already contains the full snapshot.
const status=document.querySelector('#github-refresh-status');
if(status){
  status.textContent='Repository metadata is from the verified build snapshot. Open a source link to inspect the current GitHub repository.';
}
