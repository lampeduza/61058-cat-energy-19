
var pageHeader = document.querySelector('.page-header');
var pageHeaderToggle = document.querySelector('.page-header__toggle');

pageHeader.classList.remove('page-header--no-js');

pageHeaderToggle.addEventListener('click', function() {
  pageHeader.classList.toggle('page-header--opened');
});
