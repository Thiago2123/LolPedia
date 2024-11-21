import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

window.swiper = new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    observer: true,
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true,
        scale: 1,
    },
    keyboard: {
        enabled: true,
        onlyInViewport: false,
    },
});

const pills = document.querySelectorAll('.nav-pills .nav-link');
pills.forEach(pill => {
    pill.addEventListener('shown.bs.tab', function(event) {
        // Reinicialize o Swiper quando uma pill for ativada
        swiper.update();
    });
});