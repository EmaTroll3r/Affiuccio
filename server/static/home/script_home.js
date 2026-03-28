(function () {
    "use strict";

    // Edit this array to add/remove/update games in both carousel and list.
    const games = [
        {
            id: "the-mind",
            name: "The Mind",
            route: "/TheMind",
            description: "Silent teamwork and perfect timing.",
            category: "Co-op",
            players: "2+ players",
            status: "Online",
            enabled: true,
            showInCarousel: true,
            slideClass: "placeholder-1",
            thumbClass: "thumb-1"
        },
        {
            id: "sos-online",
            name: "SOS Online",
            route: "/SosOnline",
            description: "Fast tactical moves and combo plays.",
            category: "Strategy",
            players: "2+ players",
            status: "Online",
            enabled: true,
            showInCarousel: true,
            slideClass: "placeholder-2",
            thumbClass: "thumb-2"
        },
        {
            id: "db-chess",
            name: "DB Chess",
            route: "/DBChess",
            description: "Tactical chess database.",
            category: "Classic",
            players: "1 players",
            status: "Online",
            enabled: true,
            showInCarousel: true,
            slideClass: "placeholder-3",
            thumbClass: "thumb-3"
        },
        // {
        //     id: "syncwatch",
        //     name: "SyncWatch",
        //     route: "/SyncWatch",
        //     description: "Coordination challenge in real time.",
        //     category: "Party",
        //     players: "Multiplayer",
        //     status: "Online",
        //     enabled: true,
        //     showInCarousel: true,
        //     slideClass: "placeholder-4",
        //     thumbClass: "thumb-4"
        // }
    ];

    const enabledGames = games.filter((game) => game.enabled);
    const carouselGames = enabledGames.filter((game) => game.showInCarousel);

    const carouselTrack = document.getElementById("carousel-track");
    const gamesGrid = document.getElementById("games-grid");
    const carousel = document.getElementById("home-carousel");
    const carouselCounter = document.getElementById("carousel-counter");

    function createSlide(game, isActive) {
        const link = document.createElement("a");
        link.className = "carousel-slide" + (isActive ? " active" : "");
        link.href = game.route;
        link.setAttribute("aria-label", "Open " + game.name);

        const image = document.createElement("div");
        image.className = "slide-image " + (game.slideClass || "placeholder-1");

        const title = document.createElement("h2");
        title.textContent = game.name;

        const meta = document.createElement("p");
        meta.className = "slide-meta";
        meta.textContent = game.players + " · " + game.category;

        link.appendChild(image);
        link.appendChild(title);
        link.appendChild(meta);
        return link;
    }

    function createCard(game) {
        const link = document.createElement("a");
        link.className = "game-card";
        link.href = game.route;

        const thumb = document.createElement("div");
        thumb.className = "thumb " + (game.thumbClass || "thumb-1");

        const title = document.createElement("h3");
        title.textContent = game.name;

        const description = document.createElement("p");
        description.className = "game-description";
        description.textContent = game.description || "";

        const meta = document.createElement("p");
        meta.className = "game-meta";
        meta.textContent = (game.players || "") + " · " + (game.status || "");

        link.appendChild(thumb);
        link.appendChild(title);
        link.appendChild(description);
        link.appendChild(meta);
        return link;
    }

    function renderEmptyState(container, message) {
        const state = document.createElement("div");
        state.className = "empty-state";
        state.textContent = message;
        container.appendChild(state);
    }

    function renderContent() {
        if (!carouselTrack || !gamesGrid) {
            return;
        }

        carouselTrack.innerHTML = "";
        gamesGrid.innerHTML = "";

        if (carouselGames.length === 0) {
            renderEmptyState(carouselTrack, "No games available for the carousel.");
            if (carousel) {
                carousel.classList.add("carousel-no-games");
            }
            if (carouselCounter) {
                carouselCounter.textContent = "0/0";
            }
        } else {
            for (let i = 0; i < carouselGames.length; i += 1) {
                carouselTrack.appendChild(createSlide(carouselGames[i], i === 0));
            }
            if (carouselCounter) {
                carouselCounter.textContent = "1/" + String(carouselGames.length);
            }
        }

        if (enabledGames.length === 0) {
            renderEmptyState(gamesGrid, "No games available right now.");
        } else {
            for (let i = 0; i < enabledGames.length; i += 1) {
                gamesGrid.appendChild(createCard(enabledGames[i]));
            }
        }
    }

    function setupCarousel() {
        if (!carousel) {
            return;
        }

        const slides = carousel.querySelectorAll(".carousel-slide");
        const prev = carousel.querySelector(".carousel-arrow.prev");
        const next = carousel.querySelector(".carousel-arrow.next");

        if (!slides.length || !prev || !next) {
            return;
        }

        let currentIndex = 0;
        let timer = null;
        let touchStartX = 0;
        let touchStartY = 0;

        function renderSlideState() {
            for (let i = 0; i < slides.length; i += 1) {
                slides[i].classList.toggle("active", i === currentIndex);
            }
            if (carouselCounter) {
                carouselCounter.textContent = String(currentIndex + 1) + "/" + String(slides.length);
            }
        }

        function goTo(index) {
            currentIndex = (index + slides.length) % slides.length;
            renderSlideState();
        }

        function startAutoPlay() {
            timer = window.setInterval(function () {
                goTo(currentIndex + 1);
            }, 4200);
        }

        function stopAutoPlay() {
            window.clearInterval(timer);
            timer = null;
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        prev.addEventListener("click", function () {
            goTo(currentIndex - 1);
            resetAutoPlay();
        });

        next.addEventListener("click", function () {
            goTo(currentIndex + 1);
            resetAutoPlay();
        });

        carousel.addEventListener("touchstart", function (event) {
            if (!event.touches || !event.touches.length) {
                return;
            }
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: true });

        carousel.addEventListener("touchend", function (event) {
            if (!event.changedTouches || !event.changedTouches.length) {
                return;
            }

            const endX = event.changedTouches[0].clientX;
            const endY = event.changedTouches[0].clientY;
            const deltaX = endX - touchStartX;
            const deltaY = endY - touchStartY;

            // Trigger only for horizontal gestures, so vertical page scroll stays natural.
            if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
                return;
            }

            if (deltaX < 0) {
                goTo(currentIndex + 1);
            } else {
                goTo(currentIndex - 1);
            }
            resetAutoPlay();
        }, { passive: true });

        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stopAutoPlay();
                return;
            }
            if (!timer) {
                startAutoPlay();
            }
        });

        renderSlideState();
        startAutoPlay();
    }

    renderContent();
    setupCarousel();
}());
