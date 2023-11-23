// JavaScript code for the popup functionality
const myButton = document.getElementById("myButton");
const myPopup = document.getElementById("myPopup");
const closePopup = document.getElementById("closePopup");

myButton.addEventListener("click", function () {
  myPopup.style.display = "block";
});

closePopup.addEventListener("click", function () {
  myPopup.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target === myPopup) {
    myPopup.style.display = "none";
  }
});




// Profile photo code:
const profilePhoto = document.getElementById('profile-photo');

profilePhoto.addEventListener('click', openImageUploader);

function openImageUploader() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', handleImageUpload);
  input.click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const image = new Image();

    image.onload = function () {
      const croppieContainer = document.createElement('div');
      const croppieResult = document.createElement('div');
      const doneButton = document.createElement('button');
      let croppieInstance;

      croppieContainer.appendChild(croppieResult);
      profilePhoto.appendChild(croppieContainer);
      profilePhoto.appendChild(doneButton);

      croppieInstance = new Croppie(croppieResult, {
        viewport: { width: 200, height: 200, type: 'circle' },
        boundary: { width: 300, height: 300 },
        enableOrientation: true
      });

      croppieInstance.bind({
        url: e.target.result
      });

      doneButton.textContent = 'Done';
      doneButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event bubbling

        croppieInstance.result('base64').then(function (base64Image) {
          profilePhoto.style.backgroundImage = `url(${base64Image})`;
          profilePhoto.style.backgroundSize = 'cover';
          profilePhoto.style.backgroundPosition = 'center';
          profilePhoto.style.backgroundRepeat = 'no-repeat';

          croppieInstance.destroy();
          croppieContainer.remove();
          doneButton.remove();

          profilePhoto.addEventListener('click', openImageUploader);
        });
      });
    };

    image.src = e.target.result;
  };

  reader.readAsDataURL(file);

  profilePhoto.removeEventListener('click', openImageUploader);
}





