document.addEventListener("DOMContentLoaded", () => {
  const images = [
    'images/hummus.jpg',
    'images/toast.jpg',
    'images/waffy2.jpg',
    'images/bread.jpg',
    'images/brownie.jpeg'
  ];

  let current = 0;
  const slideshow = document.getElementById('slideshow');

  setInterval(() => {
    current = (current + 1) % images.length;
    slideshow.src = images[current];
  }, 3000);
});
