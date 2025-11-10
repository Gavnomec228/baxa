document.addEventListener("DOMContentLoaded", function () {
    // Инициализация EmailJS - ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ ДАННЫЕ!
    emailjs.init("Ds9Wj1XvPekUbD7II"); // Найти в Dashboard -> Account -> Public Key

    const cart = document.querySelector(".cart");
    const cartItemsContainer = document.querySelector(".cart-items");
    const totalBlock = document.querySelector(".cart-total");
    const orderButton = document.querySelector(".order-button");
    let totalSum = 0;
    let cartItems = [];

    // Элементы модального окна ингредиентов
    const ingredientsModal = document.getElementById("ingredientsModal");
    const ingredientCheckboxes = document.querySelectorAll(".ingredient-checkbox");
    const selectedIngredientsList = document.getElementById("selectedIngredientsList");
    const modalTotalPrice = document.getElementById("modalTotalPrice");
    const addToCartModalBtn = document.getElementById("addToCartModal");
    const closeModalBtn = document.getElementById("closeModal");

    let currentShava = null;
    let basePrice = 0;
    let selectedIngredients = [];

    // Обработчики для кнопок выбора ингредиентов
    document.querySelectorAll(".customize-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const shava = this.closest(".shava");
            openIngredientsModal(shava);
        });
    });

    function openIngredientsModal(shava) {
        currentShava = shava;
        basePrice = parseInt(shava.dataset.basePrice);
        selectedIngredients = [];
        
        ingredientCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        updateSelectedIngredientsList();
        updateModalTotalPrice();
        ingredientsModal.style.display = "flex";
    }

    ingredientCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const ingredient = this.dataset.ingredient;
            const price = parseInt(this.dataset.price);
            
            if (this.checked) {
                selectedIngredients.push({ name: ingredient, price: price });
            } else {
                selectedIngredients = selectedIngredients.filter(item => item.name !== ingredient);
            }
            
            updateSelectedIngredientsList();
            updateModalTotalPrice();
        });
    });

    function updateSelectedIngredientsList() {
        selectedIngredientsList.innerHTML = "";
        selectedIngredients.forEach(ingredient => {
            const li = document.createElement("li");
            li.textContent = `${ingredient.name} (+${ingredient.price} руб.)`;
            selectedIngredientsList.appendChild(li);
        });
    }

    function updateModalTotalPrice() {
        let total = basePrice;
        selectedIngredients.forEach(ingredient => {
            total += ingredient.price;
        });
        modalTotalPrice.textContent = total;
    }

    addToCartModalBtn.addEventListener("click", function() {
        if (currentShava) {
            addToCartFromModal();
            ingredientsModal.style.display = "none";
        }
    });

    closeModalBtn.addEventListener("click", function() {
        ingredientsModal.style.display = "none";
    });

    ingredientsModal.addEventListener("click", function(e) {
        if (e.target === ingredientsModal) {
            ingredientsModal.style.display = "none";
        }
    });

    function addToCartFromModal() {
        const name = currentShava.dataset.name;
        const basePrice = parseInt(currentShava.dataset.basePrice);
        const imgSrc = currentShava.querySelector(".imgshava").src;
        
        let finalPrice = basePrice;
        let ingredientsText = "";
        let ingredientsArray = [];
        
        selectedIngredients.forEach(ingredient => {
            finalPrice += ingredient.price;
            ingredientsText += `, ${ingredient.name}`;
            ingredientsArray.push(ingredient.name);
        });

        const cartItemData = {
            name: name,
            basePrice: basePrice,
            finalPrice: finalPrice,
            ingredients: ingredientsArray,
            ingredientsText: ingredientsText ? ingredientsText.substring(2) : '',
            imgSrc: imgSrc
        };

        cartItems.push(cartItemData);

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <img src="${imgSrc}" alt="${name}">
            <div class="cart-item-details">
                <span class="cart-item-name">${name}</span>
                ${ingredientsText ? `<span class="cart-item-ingredients">Допы: ${ingredientsText.substring(2)}</span>` : ''}
            </div>
            <span class="cart-item-price">${finalPrice} руб.</span>
            <button class="remove-from-cart" type="button">Удалить</button>
        `;
        
        cartItemsContainer.appendChild(cartItem);

        totalSum += finalPrice;
        totalBlock.textContent = `Итого: ${totalSum} руб.`;

        cartItem.querySelector(".remove-from-cart").addEventListener("click", function () {
            totalSum -= finalPrice;
            totalBlock.textContent = `Итого: ${totalSum} руб.`;
            
            const index = cartItems.indexOf(cartItemData);
            if (index > -1) {
                cartItems.splice(index, 1);
            }
            
            cartItem.remove();
        });
    }

    // Функция для отправки email
    function sendOrderEmail(orderData) {
        const templateParams = {
            customer_name: orderData.customerName,
            customer_phone: orderData.customerPhone,
            customer_email: orderData.customerEmail,
            order_code: orderData.orderCode,
            total_amount: orderData.totalAmount,
            order_items: orderData.orderItems,
            order_date: orderData.orderDate,
            to_email: 'matrasina228@gmail.com'
        };

        console.log('Отправка email с данными:', templateParams);

        // ЗАМЕНИТЕ service_id и template_id на ваши реальные!
        return emailjs.send('service_yki82rs', 'template_drbx44x', templateParams)
            .then(function(response) {
                console.log('Email успешно отправлен!', response.status, response.text);
                return true;
            }, function(error) {
                console.log('Ошибка отправки email:', error);
                throw new Error('Не удалось отправить email');
            });
    }

    function formatOrderItems(items) {
        if (items.length === 0) return 'Корзина пуста';
        
        return items.map((item, index) => 
            `${index + 1}. ${item.name} - ${item.finalPrice} руб.${item.ingredientsText ? ` (Допы: ${item.ingredientsText})` : ''}`
        ).join('\n');
    }

    // Модальное окно для оформления заказа
    orderButton.addEventListener("click", function () {
        if (totalSum === 0) {
            alert("Ваша корзина пуста!");
            return;
        }

        const orderModal = document.createElement("div");
        orderModal.className = "modal-overlay";
        orderModal.style.display = "flex";

        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";
        modalContent.innerHTML = `
            <h3>Оформление заказа</h3>
            <input type="text" id="customerName" placeholder="Имя получателя *" required>
            <input type="tel" id="customerPhone" placeholder="Номер телефона *" required>
            <input type="email" id="customerEmail" placeholder="Email (для уведомлений)">
            <p><strong>Сумма заказа: ${totalSum} руб.</strong></p>
            <div class="modal-buttons">
                <button id="payButton" class="add-to-cart-btn">Оформить заказ</button>
                <button id="cancelOrder" class="close-modal-btn">Отмена</button>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">* - обязательные поля</p>
        `;

        orderModal.appendChild(modalContent);
        document.body.appendChild(orderModal);

        // Обработчик оформления заказа
        modalContent.querySelector("#payButton").addEventListener("click", async function () {
            const name = document.getElementById("customerName").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const email = document.getElementById("customerEmail").value.trim();

            if (!name || !phone) {
                alert("Пожалуйста, заполните обязательные поля (имя и телефон)!");
                return;
            }

            if (phone.length < 5) {
                alert("Пожалуйста, введите корректный номер телефона!");
                return;
            }

            // Генерация кода заказа
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            const randomNumbers = Math.floor(Math.random() * 9000) + 1000;
            const orderCode = randomLetter + randomNumbers;

            // Подготовка данных
            const orderData = {
                customerName: name,
                customerPhone: phone,
                customerEmail: email || 'Не указан',
                orderCode: orderCode,
                totalAmount: totalSum,
                orderItems: formatOrderItems(cartItems),
                orderDate: new Date().toLocaleString('ru-RU')
            };

            // Показ загрузки
            const payButton = this;
            payButton.disabled = true;
            payButton.textContent = 'Отправка...';

            try {
                // Отправка email
                await sendOrderEmail(orderData);
                
                // Успешное оформление
                modalContent.innerHTML = `
                    <h3>✅ Заказ оформлен!</h3>
                    <div style="text-align: center; padding: 20px;">
                        <p style="font-size: 1.2rem; margin-bottom: 10px;">Код заказа: <strong>${orderCode}</strong></p>
                        <p style="margin-bottom: 10px;">Сумма: <strong>${totalSum} руб.</strong></p>
                        <p style="margin-bottom: 10px;">✅ Письмо с деталями отправлено</p>
                        <p style="margin-bottom: 20px;">📞 Ожидайте звонка оператора</p>
                        <button id="closeSuccessModal" class="add-to-cart-btn">Отлично!</button>
                    </div>
                `;

                // Очистка корзины
                cartItemsContainer.innerHTML = "";
                totalSum = 0;
                totalBlock.textContent = `Итого: ${totalSum} руб.`;
                cartItems = [];

                modalContent.querySelector("#closeSuccessModal").addEventListener("click", function() {
                    document.body.removeChild(orderModal);
                });

            } catch (error) {
                // Ошибка отправки email, но заказ все равно оформлен
                console.error('Ошибка:', error);
                modalContent.innerHTML = `
                    <h3>⚠️ Заказ оформлен!</h3>
                    <div style="text-align: center; padding: 20px;">
                        <p style="font-size: 1.2rem; margin-bottom: 10px;">Код заказа: <strong>${orderCode}</strong></p>
                        <p style="margin-bottom: 10px;">Сумма: <strong>${totalSum} руб.</strong></p>
                        <p style="margin-bottom: 10px; color: #ff6b6b;">⚠️ Письмо не отправлено, но заказ принят!</p>
                        <p style="margin-bottom: 20px;">📞 Ожидайте звонка оператора</p>
                        <button id="closeSuccessModal" class="add-to-cart-btn">Понятно</button>
                    </div>
                `;

                // Очистка корзины даже при ошибке email
                cartItemsContainer.innerHTML = "";
                totalSum = 0;
                totalBlock.textContent = `Итого: ${totalSum} руб.`;
                cartItems = [];

                modalContent.querySelector("#closeSuccessModal").addEventListener("click", function() {
                    document.body.removeChild(orderModal);
                });
            }
        });

        modalContent.querySelector("#cancelOrder").addEventListener("click", function() {
            document.body.removeChild(orderModal);
        });

        orderModal.addEventListener("click", function (e) {
            if (e.target === orderModal) {
                document.body.removeChild(orderModal);
            }
        });

        document.addEventListener('keydown', function closeModalOnEsc(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(orderModal);
                document.removeEventListener('keydown', closeModalOnEsc);
            }
        });
    });

    // Обработчик для кнопки в баннере
    document.querySelector('.click').addEventListener('click', function() {
        document.getElementById('menu').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
});