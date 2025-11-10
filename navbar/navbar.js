document.addEventListener("DOMContentLoaded", () => {
	const menuWrap = document.querySelector(".menu_wrap");
	const menuButton = document.querySelector(".menu_button");
	const menuLinks = document.querySelectorAll(".menu_link");

	if (!menuWrap || !menuButton) return;

	const closeMenu = () => {
		menuWrap.classList.remove("is-open");
		document.body.classList.remove("no-scroll");
	};

	const toggleMenu = () => {
		const willOpen = !menuWrap.classList.contains("is-open");
		menuWrap.classList.toggle("is-open", willOpen);
		document.body.classList.toggle("no-scroll", willOpen);
	};

	menuButton.addEventListener("click", toggleMenu);
	menuLinks.forEach((link) => {
		link.addEventListener("click", closeMenu);
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			closeMenu();
		}
	});
});



