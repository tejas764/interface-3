const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerMenuToggle = document.querySelector(".hamburger-menu-toggle");
hamburgerMenuToggle.onclick = () => {
    hamburgerMenu.classList.toggle("show");
}

// let currentIndex = 0;
// const slider = document.getElementById('slider');
// const totalSlides = slider.children.length;

// function slide(direction) {
//     currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
//     slider.style.transform = `translateX(-${currentIndex * 100}%)`;
// }