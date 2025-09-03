document.addEventListener('DOMContentLoaded', function() {
    const cart = document.querySelector('.cart');
    let totalSum = 0;

    // Создаём контейнер для товаров внутри корзины
    const cartItemsContainer = document.createElement('div');
    cartItemsContainer.className = 'cart-items';
    cart.appendChild(cartItemsContainer);

    // Блок для отображения суммы (внутри корзины)
    const totalBlock = document.createElement('div');
    totalBlock.className = 'cart-total';
    totalBlock.textContent = 'Итого: 0 руб.';
    cart.appendChild(totalBlock);

    // Кнопка "Заказать" (внутри корзины)
    const orderButton = document.createElement('button');
    orderButton.className = 'order-button';
    orderButton.textContent = 'Заказать';
    cart.appendChild(orderButton);

    // Обработчики добавления в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.shava');
            const name = item.querySelector('.nameshava').textContent;
            const costText = item.querySelector('.cost').textContent;
            const cost = parseInt(costText.replace(/\D/g, ''));
            const imgSrc = item.querySelector('.imgshava').src;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${imgSrc}" alt="${name}">
                <span>${name}</span>
                <span>${costText}</span>
                <button class="remove-from-cart" type="button">Удалить</button>
            `;
            cartItemsContainer.appendChild(cartItem);

            // Подсчёт суммы
            totalSum += cost;
            totalBlock.textContent = `Итого: ${totalSum} руб.`;

            // Удаление товара
            cartItem.querySelector('.remove-from-cart').addEventListener('click', function() {
                totalSum -= cost;
                totalBlock.textContent = `Итого: ${totalSum} руб.`;
                cartItem.remove();
            });
        });
    });

    // Модальное окно для оформления заказа
    orderButton.addEventListener('click', function() {
        if (totalSum === 0) {
            alert('Ваша корзина пуста!');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <h3>Оформление заказа</h3>
            <input type="text" id="customerName" placeholder="Имя получателя">
            <input type="tel" id="customerPhone" placeholder="Номер телефона">
            <p>Сумма заказа: ${totalSum} руб.</p>
            <button id="payButton">Оплатить</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Обработчик оплаты
        modalContent.querySelector('#payButton').addEventListener('click', function() {
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();

            if (!name || !phone) {
                alert('Пожалуйста, заполните все поля!');
                return;
            }

            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            const randomNumbers = Math.floor(Math.random() * 90) + 10;
            const orderCode = randomLetter + randomNumbers;

            alert(`Заказ оформлен! Ваш код заказа: ${orderCode}. Ожидайте звонка оператора.`);
            modal.remove();
        });

        // Закрытие модального окна по клику вне его
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });
});
