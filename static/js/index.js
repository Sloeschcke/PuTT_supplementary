window.HELP_IMPROVE_VIDEOJS = false;


var NUM_INTERP_FRAMES = 24;
var old_img_t = 6;
var canv = document.createElement("canvas");
const interp_images = Object.create(null);
// var interp_images = [];
const dists = [22, 0, 37, 135, 155, 170];
var disparity_image;
var pixelData;
var image;
var current_dist = 170;
var demo_guide;


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

  

    bulmaSlider.attach();

})

const img = new Image();

// When the image is loaded, create a canvas element and draw the image on it
img.onload = function() {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  console.log("Image width " + img.width)

  // Get the pixel data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  pixelData = imageData.data;

  // Get the color of the pixel at position (x, y)
  const x = 10;
  const y = 10;
  const index = (y * canvas.width + x) * 4; // Multiply by 4 because each pixel is represented by 4 values (R,G,B,A)
  const red = pixelData[index];
  const green = pixelData[index + 1];
  const blue = pixelData[index + 2];
  const alpha = pixelData[index + 3];

  // Print the color values to the console
  console.log(`Pixel color at position (${x}, ${y}): rgb(${red}, ${green}, ${blue}), alpha: ${alpha}`);
}

// Set the source of the image

function FindPosition(oElement)
{
  if(typeof( oElement.offsetParent ) != "undefined")
  {
    for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
    {
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
      return [ posX, posY ];
    }
    else
    {
      return [ oElement.x, oElement.y ];
    }
}
function GetCoordinates(e)
{
  var PosX = 0;
  var PosY = 0;
  var ImgPos;
  ImgPos = FindPosition(image);
  if (!e) var e = window.event;
  if (e.pageX || e.pageY)
  {
    PosX = e.pageX;
    PosY = e.pageY;
  }
  else if (e.clientX || e.clientY)
    {
      PosX = e.clientX + document.body.scrollLeft
        + document.documentElement.scrollLeft;
      PosY = e.clientY + document.body.scrollTop
        + document.documentElement.scrollTop;
    }
  PosX = PosX - ImgPos[0];
  PosY = PosY - ImgPos[1];

  console.log("window width " +  window.width);

  var element = document.querySelector('#interpolation-image-wrapper');
  let width = element.offsetWidth;
  let height = element.offsetHeight;

  var scaledPosY = Math.abs(Math.round(2024 / height * PosY));
  var scaledPosX = Math.abs(Math.round(2688 / width * PosX));

  var pixel_index = (scaledPosY * 2688 + scaledPosX) * 4; // Multiply by 4 because each pixel is represented by 4 values (R,G,B,A)
  red_val = pixelData[pixel_index + 0];
  green_val = pixelData[pixel_index + 1];
  blue_val = pixelData[pixel_index + 2];
  current_dist = blue_val;
  setInterpolationImage(old_img_t);
  // document.getElementById("x").innerHTML = PosX;
  // document.getElementById("y").innerHTML = PosY;
  // console.log(width, height);
  // console.log(scaledPosY, scaledPosX);
  // console.log("RGB " + red_val + " " + green_val + " " + blue_val);
  // console.log("touch x " + PosX + " y " + PosY);
}


function moveDivisor() { 
  var divisor = document.getElementById("divisor"),
  slider = document.getElementById("compare_slider");
	divisor.style.width = slider.value+"%";
}

function changedata(parameter){
  if(parameter==0){
      document.getElementById('girl16k').style.display = 'none';
      document.getElementById('tokyo16k').style.display = 'block';
      document.getElementById('example1_btn').className = 'btn active';
      document.getElementById('example2_btn').className = 'btn';
  }
  else if(parameter==1){
      document.getElementById('tokyo16k').style.display = 'none';
      document.getElementById('girl16k').style.display = 'block';
      document.getElementById('example1_btn').className = 'btn';
      document.getElementById('example2_btn').className = 'btn active';
  }
  this.className += " active";
}

function showExampleIncompleteData(exampleId, buttonId) {
  // Hide all examples
  document.getElementById('example1').style.display = 'none';
  document.getElementById('example2').style.display = 'none';
  document.getElementById('example3').style.display = 'none';

  // Remove 'active' class from all buttons
  document.getElementById('btn1').classList.remove('active');
  document.getElementById('btn2').classList.remove('active');
  document.getElementById('btn3').classList.remove('active');

  // Add 'active' class to clicked button
  document.getElementById(buttonId).classList.add('active');

  // Show the selected example
  document.getElementById(exampleId).style.display = 'block';
}

function showExampleNoisyData(exampleId, buttonId) {
  // Hide all examples
  document.getElementById('example1_noise').style.display = 'none';
  document.getElementById('example2_noise').style.display = 'none';
  document.getElementById('example3_noise').style.display = 'none';

  // Remove 'active' class from all buttons
  document.getElementById('btn1_noise').classList.remove('active');
  document.getElementById('btn2_noise').classList.remove('active');
  document.getElementById('btn3_noise').classList.remove('active');

  // Add 'active' class to clicked button
  document.getElementById(buttonId).classList.add('active');

  // Show the selected example
  document.getElementById(exampleId).style.display = 'block';
}

function changeexample(image_to_show, image_to_hide, btn_to_active, btn_to_normal){
      document.getElementById(image_to_show).style.display = 'block';
      document.getElementById(image_to_hide).style.display = 'none';
      document.getElementById(btn_to_active).className = 'btn active';
      document.getElementById(btn_to_normal).className = 'btn';
}

function toggleimage(image_to_show, image_to_hide, btn_to_active, btn_to_normal){
  document.getElementById(image_to_show).style.display = 'block';
  document.getElementById(image_to_hide).style.display = 'none';
  document.getElementById(btn_to_active).className = 'btn active';
  document.getElementById(btn_to_normal).className = 'btn';
}

function toggleimage3(img1, img2, img3, btn1, btn2, btn3, img_slider, img_slider_target) {
    var image1 = document.getElementById(img1);
    var image2 = document.getElementById(img2);
    var image3 = document.getElementById(img3);
    var button1 = document.getElementById(btn1);
    var button2 = document.getElementById(btn2);
    var button3 = document.getElementById(btn3);
    var sliderImages = document.querySelectorAll('.compare .slider-image');

    // Hide all images
    image1.style.display = 'none';
    image2.style.display = 'none';
    image3.style.display = 'none';

    // Reset button classes
    button1.classList.remove('active');
    button2.classList.remove('active');
    button3.classList.remove('active');

    // Set the clicked button to active and display the corresponding image
    if (btn1 === event.currentTarget.id) {
        button1.classList.add('active');
        image1.style.display = 'block';
        sliderImages[0].src = img_slider;
        sliderImages[1].src = img_slider_target;
    } else if (btn2 === event.currentTarget.id) {
        button2.classList.add('active');
        image2.style.display = 'block';
        sliderImages[0].src = img_slider;
        sliderImages[1].src = img_slider_target;
    } else if (btn3 === event.currentTarget.id) {
        button3.classList.add('active');
        image3.style.display = 'block';
        sliderImages[0].src = img_slider;
        sliderImages[1].src = img_slider_target;
    }
}

$(function(){
  $(".compare").twentytwenty({
    default_offset_pct: 0.5, // How much of the before image is visible when the page loads
    orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
    before_label: 'Input', // Set a custom before label
    after_label: 'Output', // Set a custom after label
    no_overlay: true, //Do not show the overlay with before and after
    move_slider_on_hover: true, // Move slider on mouse hover?
    move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
    click_to_move: true // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
  });
});

$('.compare').imagesLoaded(function() {
  $(".compare").twentytwenty({
    default_offset_pct: 0.5, // How much of the before image is visible when the page loads
    orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
    before_label: 'Input', // Set a custom before label
    after_label: 'Output', // Set a custom after label
    no_overlay: true, //Do not show the overlay with before and after
    move_slider_on_hover: true, // Move slider on mouse hover?
    move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
    click_to_move: true // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
  });
  console.log("images loaded");
});

setTimeout(function() {
  // $(".compare").twentytwenty({
  //   default_offset_pct: 0.5, // How much of the before image is visible when the page loads
  //   orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
  //   before_label: 'Input', // Set a custom before label
  //   after_label: 'Output', // Set a custom after label
  //   no_overlay: true, //Do not show the overlay with before and after
  //   move_slider_on_hover: true, // Move slider on mouse hover?
  //   move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
  //   click_to_move: true // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
  // });
  window.dispatchEvent(new Event('resize')); 
  console.log("loaded after tiemout");
  document.getElementById('girl16k').style.display = 'none';
  // document.getElementById('tokyo16').style.display = 'none';
  }, 2000);

// $(window).load(function() {
//   $(window).trigger("resize.twentytwenty");
// });


function switchImages(location) {
  // Define the base paths for the two locations
  var basePath = {
    girl: "static/images/girl_patches/",
    tokyo: "static/images/tokyo_patches/"
  };

  // Define the image names for Tokyo; use similar pattern if girl images differ
  var imageNames = ["PuTT_0.png", "TT-noup_0.png", "CP_0.png", "Tucker_0.png", "PuTT_1.png", "TT-noup_1.png", "CP_1.png", "Tucker_1.png"];

  // Switch large image
  document.querySelector(".large-image img").src = basePath[location] + (location === 'girl' ? "PuTT_full_image_with_zoom_area.png" : "PuTT_full_image_with_zoom_area.png");

  // Switch small images
  var smallImages = document.querySelectorAll(".small-image img");
  smallImages.forEach(function(img, index) {
    img.src = basePath[location] + imageNames[index];
  });

// Change the active button
document.querySelectorAll('.btn').forEach(function(btn) {
  btn.classList.remove('active');
});
document.getElementById(location === 'girl' ? 'example1_btn' : 'example2_btn').classList.add('active');
}

// Set the initial state to Girl16k
window.onload = function() {
  switchImages('girl');
};

function switchExampleNearFar(baseName) {
  // Define the base path for images
  var basePath = "static/images/near_far/" + baseName + "/";

  function updateImageSource(id, newSrc) {
    var img = document.getElementById(id);
    if (img) {
      img.src = basePath + newSrc;
    } else {
      console.error("Image not found for ID: ", id);
    }
  }

  // Update the sources for Ground Truth, TensoRF, and PuTT images
  updateImageSource('gt_far', "GT-far.png");
  updateImageSource('gt_near', "GT-near.png");
  updateImageSource('tensorf_far', "Tensorf_far.png");
  updateImageSource('tensorf_near', "Tensorf_near.png");
  updateImageSource('putt_far', "PuTT_far.png");
  updateImageSource('putt_near', "PuTT_near.png");

  // Update active button state
  document.querySelectorAll('.button-group .btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  document.getElementById('btn_' + baseName).classList.add('active');
}

// Initialize with the first example
window.onload = function() {
  switchExampleNearFar('chair');
};
