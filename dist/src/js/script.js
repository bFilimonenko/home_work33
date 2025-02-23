//process accordion
const acc = document.querySelectorAll(".accordion-button");

let special = document.querySelector(".current");
special.style.display = "block";

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    const description = this.nextElementSibling;
    if (description.style.display === "block") {
      description.style.display = "none";
    } else {
      description.style.display = "block";
    }
  });
}

//testimonials slider
document.addEventListener("DOMContentLoaded", () => {
  const testimonialsList = document.querySelector(".testimonials-block-list");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  const cards = document.querySelectorAll(".testimonials-block-card");
  const radioButtons = document.querySelectorAll(".radio-buttons input");

  let currentIndex = 0; // Start with the first card
  let startOffset = 95; // Initial offset for the first element
  let stepOffset = 50; // Offset step for each card

  if (window.innerWidth <= 480) {
    startOffset = 224;
    stepOffset = 112;
  }else if (window.innerWidth <= 768) {
    startOffset = 210;
    stepOffset = 105;
  }
  // Update slider position
  const updateSlider = (startOffset, stepOffset) => {
    testimonialsList.style.transform = `translateX(${startOffset - currentIndex * stepOffset}%)`;
    testimonialsList.style.transition = "transform 0.5s ease-in-out"; // Smooth transition
    updateRadioButtons();
  };

  // Update radio buttons to reflect the active card
  const updateRadioButtons = () => {
    radioButtons.forEach((radio, index) => {
      radio.checked = index === currentIndex;
    });
  };

  // Next button functionality
  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % cards.length; // Loop back to start
    updateSlider(startOffset, stepOffset);
  });

  // Previous button functionality
  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length; // Loop back to end
    updateSlider(startOffset, stepOffset);
  });

  // Radio button functionality
  radioButtons.forEach((radio, index) => {
    radio.addEventListener("change", () => {
      currentIndex = index; // Update the index to match the selected radio
      updateSlider(startOffset, stepOffset);
    });
  });

  window.addEventListener("resize", function(event) {
    if (window.innerWidth <= 480) {
      startOffset = 224;
      stepOffset = 112;
    } else if (window.innerWidth <= 768) {
      startOffset = 210;
      stepOffset = 105;
    } else {
      startOffset = 95;
      stepOffset = 50;
    }
    updateSlider(startOffset, stepOffset);
  });

  // Initialize the slider
  updateSlider(startOffset, stepOffset);
});


