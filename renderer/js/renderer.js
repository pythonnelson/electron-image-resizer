// const { ipcRenderer } = require("electron");

const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  //Check if image is the accepted type
  if (!isFileImage(file)) {
    alertError("Please select an Image");
    return;
  }

  // Get original image dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  // Show image form and image attributes
  form.style.display = "block";
  filename.innerHTML = file.name;
  outputPath.innerText = path.join(os.homedir(), "electronResizer");
}

// Handle form to send image data
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please provide a value for both width and height");
    return;
  }

  // send to main using ipcRenderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// Catch the image that is done event
ipcRenderer.on("image:done", () => {
  alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`);
});

// check if its an image
function isFileImage(file) {
  const acceptedImageTypes = [
    "image/gif",
    "image/png",
    "image/jpg",
    "image/jpeg",
  ];

  return file && acceptedImageTypes.includes(file["type"]);
}

// Alert for errors
function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 4000,
    close: false,
    gravity: "top",
    positin: "right",
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

// Alert for success
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 4000,
    close: false,
    gravity: "top",
    positin: "right",
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

// Add event listener to the image input
img.addEventListener("change", loadImage);

// Event listener for the form solution
form.addEventListener("submit", sendImage);
