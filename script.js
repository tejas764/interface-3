
    let currentIndex = 0;
    const slider = document.getElementById('slider');
    const totalSlides = slider.children.length;

    function slide(direction) {
      currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
      slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }