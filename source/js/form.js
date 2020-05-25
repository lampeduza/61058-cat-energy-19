var number = document.getElementById("number");
var formButton = document.querySelector("form__button");
var email = document.getElementById("mail");

formButton.addEventListener("input", function (evt) {
  if (tel.validity.typeMismatch) {
    number.setCustomValidity("I expect an e-mail, darling!");
  } else {
    number.setCustomValidity("");
  }
});
