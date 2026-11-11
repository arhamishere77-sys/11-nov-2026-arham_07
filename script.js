document.addEventListener("DOMContentLoaded", () => {

    // Current year in footer

    document.querySelectorAll(".year").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });


    // Mobile navigation

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.textContent = isOpen ? "✕" : "☰";

        });

        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuToggle.setAttribute("aria-expanded", "false");

                menuToggle.textContent = "☰";

            });

        });
    }


    // Menu filtering and searching

    const menuCards = [...document.querySelectorAll(".menu-card")];

    const filterButtons = document.querySelectorAll(".filter-btn");

    const menuSearch = document.querySelector("#menu-search");

    const emptyMessage = document.querySelector(".empty-message");

    let activeFilter = "all";


    function filterMenu() {

        if (!menuCards.length) return;

        const searchTerm = menuSearch
            ? menuSearch.value.toLowerCase().trim()
            : "";

        let visibleCount = 0;

        menuCards.forEach((card) => {

            const matchesCategory =
                activeFilter === "all" ||
                card.dataset.category === activeFilter;

            const matchesSearch =
                card.dataset.name.includes(searchTerm);

            const shouldShow = matchesCategory && matchesSearch;

            card.hidden = !shouldShow;

            if (shouldShow) visibleCount++;

        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount !== 0;
        }
    }


    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter = button.dataset.filter;

            filterMenu();

        });

    });


    if (menuSearch) {
        menuSearch.addEventListener("input", filterMenu);
    }


    // Shopping order system

    const order = [];

    const orderList = document.querySelector("#order-list");

    const orderTotal = document.querySelector("#order-total");

    const orderCount = document.querySelector(".order-count");

    const checkoutButton = document.querySelector("#checkout-button");


    function renderOrder() {

        if (!orderList) return;

        orderList.innerHTML = "";

        if (order.length === 0) {

            const empty = document.createElement("li");

            empty.className = "empty-order";

            empty.textContent =
                "Your order is empty — add a favourite!";

            orderList.appendChild(empty);
        }

        let total = 0;

        let count = 0;


        order.forEach((item, index) => {

            total += item.price * item.quantity;

            count += item.quantity;

            const listItem = document.createElement("li");

            const itemName = document.createElement("span");

            const itemPrice = document.createElement("strong");

            const removeButton = document.createElement("button");

            itemName.textContent =
                `${item.name} × ${item.quantity}`;

            itemPrice.textContent =
                `Rs. ${(item.price * item.quantity).toLocaleString("en-PK")}`;

            removeButton.textContent = "Remove";

            removeButton.className = "remove-item";

            removeButton.type = "button";

            removeButton.addEventListener("click", () => {

                order.splice(index, 1);

                renderOrder();

            });

            itemName.appendChild(removeButton);

            listItem.append(itemName, itemPrice);

            orderList.appendChild(listItem);

        });


        if (orderTotal) {
            orderTotal.textContent =
                `Rs. ${total.toLocaleString("en-PK")}`;
        }

        if (orderCount) {
            orderCount.textContent = `(${count} items)`;
        }

    }


    // Add items to order

    document.querySelectorAll(".add-button").forEach((button) => {

        button.addEventListener("click", () => {

            const name = button.dataset.item;

            const price = Number(button.dataset.price);

            const existingItem = order.find(
                (item) => item.name === name
            );

            if (existingItem) {

                existingItem.quantity++;

            } else {

                order.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }

            renderOrder();

            const originalText = button.textContent;

            button.textContent = "Added ✓";

            window.setTimeout(() => {

                button.textContent = originalText;

            }, 900);

        });

    });


    // Continue to contact page

    if (checkoutButton) {

        checkoutButton.addEventListener("click", () => {

            if (order.length === 0) {

                alert("Please add at least one dish first.");

                return;

            }

            const orderSummary = order
                .map((item) => `${item.name} x ${item.quantity}`)
                .join(", ");

            sessionStorage.setItem(
                "purpleBasilOrder",
                orderSummary
            );

            window.location.href = "contact.html#reservation";

        });

    }


    // Booking date validation

    const bookingDate = document.querySelector("#booking-date");

    if (bookingDate) {

        const today = new Date();

        const localDate = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];

        bookingDate.min = localDate;

    }


    // Reservation form

    const contactForm = document.querySelector("#reservation");

    const formMessage = document.querySelector("#form-message");


    if (contactForm && formMessage) {

        const savedOrder = sessionStorage.getItem("purpleBasilOrder");

        const messageBox =
            contactForm.querySelector('textarea[name="message"]');

        if (savedOrder && messageBox) {

            messageBox.value =
                `I'd like to ask about this order: ${savedOrder}`;

            sessionStorage.removeItem("purpleBasilOrder");

        }


        contactForm.addEventListener("submit", (event) => {

            event.preventDefault();

            formMessage.className = "form-message";

            if (!contactForm.checkValidity()) {

                contactForm.reportValidity();

                formMessage.textContent =
                    "Please complete the required fields correctly.";

                formMessage.classList.add("error");

                return;

            }


            const selectedDate =
                new Date(`${bookingDate.value}T00:00:00`);

            const today = new Date();

            today.setHours(0, 0, 0, 0);


            if (selectedDate < today) {

                formMessage.textContent =
                    "Please choose today or a future date.";

                formMessage.classList.add("error");

                return;

            }


            const guestName =
                contactForm.elements.name.value.trim();

            formMessage.textContent =
                `Thank you, ${guestName}! Your request has been checked in this demo. Please call the restaurant to confirm your booking.`;

            formMessage.classList.add("success");

            contactForm.reset();

        });

    }

});
