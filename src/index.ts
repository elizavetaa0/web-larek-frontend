import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/base/Modal';
import { Cart } from './components/base/Cart';
import { ICatalogueProduct } from './types';
import { OrderForm } from './components/OrderForm';
import { Success } from './components/base/Success';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const cardCatalogueTemplate =
	ensureElement<HTMLTemplateElement>('#card-catalog');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const basketTemplateContent =
	ensureElement<HTMLTemplateElement>('#basket').content;

const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cart = new Cart(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);

events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogueTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

function updateCartCounter() {
	const basketButton = document.querySelector('.header__basket');
	const cartItemsCount = cart.getCartItems().length;
	const counterElement = basketButton.querySelector('.header__basket-counter');
	if (counterElement) {
		counterElement.textContent = cartItemsCount.toString();
	}
}

events.on('card:select', (selectedItem: ICatalogueProduct) => {
	const cardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
	const cardContent = cardTemplate.content.cloneNode(true) as HTMLElement;

	const image = cardContent.querySelector('.card__image') as HTMLImageElement;
	const category = cardContent.querySelector('.card__category') as HTMLElement;
	const title = cardContent.querySelector('.card__title') as HTMLElement;
	const text = cardContent.querySelector('.card__text') as HTMLElement;
	const button = cardContent.querySelector(
		'.card__button'
	) as HTMLButtonElement;
	const price = cardContent.querySelector('.card__price') as HTMLElement;

	image.src = selectedItem.image;
	image.alt = selectedItem.title;
	category.textContent = selectedItem.category;
	title.textContent = selectedItem.title;
	text.textContent = selectedItem.description;
	price.textContent = `${selectedItem.price} синапсов`;

	const isItemInCart = cart.isItemInCart(selectedItem.id);
	if (isItemInCart || selectedItem.price === null) {
		button.disabled = true;
	} else {
		button.disabled = false;
	}

	modal.render({ content: cardContent });

	button.addEventListener('click', () => {
		cart.addItem(selectedItem);
		button.disabled = true;
		updateCartCounter();
	});

	updateCartCounter();
});

const basketButton = document.querySelector('.header__basket');
basketButton.addEventListener('click', () => {
	const basketContent = basketTemplateContent.cloneNode(true) as HTMLElement;
	const basketList = basketContent.querySelector(
		'.basket__list'
	) as HTMLElement;
	const basketPrice = basketContent.querySelector('.basket__price');
	updateCartContent(basketList);
	const cartItems = cart.getCartItems();
	const totalPrice = cartItems.reduce((total, item) => {
		total += item.price;
		return total;
	}, 0);
	basketPrice.textContent = `${totalPrice} синапсов`;
	const orderButton = basketContent.querySelector('.basket__button');
	orderButton.addEventListener('click', (evt) => {
		events.emit('order:open');
	});
	modal.render({ content: basketContent });
	updateOrderButtonState();
});

function updateCartContent(basketList: HTMLElement) {
	basketList.innerHTML = '';
	const cartItems = cart.getCartItems();
	let totalPrice = 0;

	cartItems.forEach((item) => {
		const cartItem = cloneTemplate(cardBasketTemplate);
		const title = cartItem.querySelector('.card__title') as HTMLElement;
		const price = cartItem.querySelector('.card__price') as HTMLElement;
		const deleteButton = cartItem.querySelector(
			'.basket__item-delete'
		) as HTMLButtonElement;

		title.textContent = item.title;
		price.textContent = `${item.price} синапсов`;

		totalPrice += item.price;

		deleteButton.addEventListener('click', () => {
			const itemId = item.id;
			cart.removeItem(itemId);
			updateCartContent(basketList);
			updateCartCounter();
			updateOrderButtonState();
		});

		basketList.appendChild(cartItem);
	});

	const basketPrice = document.querySelector('.basket__price');

	if (basketPrice) {
		basketPrice.textContent = `${totalPrice} синапсов`;
	}

	updateCartCounter();
}

function updateOrderButtonState() {
	const orderButton = document.querySelector(
		'.basket__button'
	) as HTMLButtonElement;
	const cartItems = cart.getCartItems();

	if (cartItems.length === 0) {
		orderButton.setAttribute('disabled', 'true');
	} else {
		orderButton.removeAttribute('disabled');
	}
}

events.on('order:open', () => {
	const basketContent = basketTemplateContent.cloneNode(true) as HTMLElement;
	const basketList = basketContent.querySelector(
		'.basket__list'
	) as HTMLElement;
	updateCartContent(basketList);
	const orderFormContent = order.render({
		address: '',
		email: appData.order.email,
		phone: appData.order.phone,
		valid: false,
		errors: [],
	});

	modal.render({ content: orderFormContent });

	const paymentMethodButtons =
		orderFormContent.querySelectorAll<HTMLButtonElement>(
			'.order__buttons button'
		);
	paymentMethodButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const selectedMethod = button.getAttribute('name');
			order.togglePaymentButtonStyles(selectedMethod);
			order.updateSubmitButtonState();
			appData.order.payment = selectedMethod;
		});
	});

	const addressInput = orderFormContent.querySelector(
		'input[name="address"]'
	) as HTMLInputElement;
	const nextButton = orderFormContent.querySelector('.order__button');
	nextButton.setAttribute('disabled', 'true');

	function updateNextButtonState() {
		const addressValue = addressInput.value.trim();
		const selectedPaymentMethod = appData.order.payment;

		const addressRegex = /^\d{6},\s*[\p{L}\d\s.,-]+$/u;
		const isAddressValid = addressRegex.test(addressValue);
		const isPaymentSelected = !!selectedPaymentMethod;

		if (isAddressValid && isPaymentSelected) {
			nextButton.removeAttribute('disabled');
		} else {
			nextButton.setAttribute('disabled', 'true');
		}
	}

	addressInput.addEventListener('input', () => {
		updateNextButtonState();
	});

	nextButton.addEventListener('click', (evt) => {
		evt.preventDefault();
		const addressValue = addressInput.value.trim();
		const selectedPaymentMethod = appData.order.payment;

		if (addressValue === '' || !selectedPaymentMethod) {
			return;
		}

		const addressRegex = /^\d{6},\s*[\p{L}\d\s.,-]+$/u;
		if (!addressRegex.test(addressValue)) {
			return;
		}

		modal.close();
		appData.order.address = addressValue;
		events.emit('contacts:open');
	});

	updateNextButtonState();
});

events.on('contacts:open', () => {
	const contactsFormContent = contactsTemplate.content.cloneNode(
		true
	) as HTMLElement;

	const emailInput = contactsFormContent.querySelector(
		'input[name="email"]'
	) as HTMLInputElement;
	const phoneInput = contactsFormContent.querySelector(
		'input[name="phone"]'
	) as HTMLInputElement;
	const payButton = contactsFormContent.querySelector(
		'.modal__actions button'
	) as HTMLButtonElement;

	emailInput.addEventListener('input', () => {
		updateSubmitButtonState();
	});

	phoneInput.addEventListener('input', () => {
		updateSubmitButtonState();
	});

	function updateSubmitButtonState() {
		const isEmailValid = validateEmail(emailInput.value.trim());
		const isPhoneValid = validatePhone(phoneInput.value.trim());
		payButton.disabled = !isEmailValid || !isPhoneValid;
	}
	updateSubmitButtonState();

	modal.render({ content: contactsFormContent });

	payButton.addEventListener('click', (evt) => {
		evt.preventDefault();
		modal.close();
		appData.order.email = emailInput.value.trim();
		appData.order.phone = phoneInput.value.trim();
		events.emit('order:submit');
		events.emit('success:open');
	});
});

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
	const phoneRegex = /^\+\d{1,2}\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
	return phoneRegex.test(phone);
}

events.on('success:open', () => {
	const successTemplateContent = ensureElement<HTMLTemplateElement>(
		'#success'
	).content.cloneNode(true) as HTMLElement;

	const cartItems = cart.getCartItems();
	const cartSum = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

	const descriptionElement = successTemplateContent.querySelector(
		'.order-success__description'
	) as HTMLElement;
	descriptionElement.textContent = `Списано ${cartSum} синапсов`;

	const successCloseButton = successTemplateContent.querySelector(
		'.order-success__close'
	);
	successCloseButton.addEventListener('click', (evt) => {
		evt.preventDefault();
		modal.close();
		cart.clearBasket();
		updateCartCounter();
	});

	modal.render({ content: successTemplateContent });
	cart.clearBasket();
	updateCartCounter();
});

events.on('order:submit', () => {
	const cartItems = cart.getCartItems();
	const cartSum = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

	const orderData = {
		payment: appData.order.payment,
		email: appData.order.email,
		phone: appData.order.phone,
		address: appData.order.address,
		total: cartSum,
		items: cartItems.map((item) => item.id),
	};

	api
		.orderItems(orderData)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					cart.clearBasket();
					updateCartCounter();
					events.emit('order:changed');
				},
			});
		})
		.catch((err) => {
			console.error('Ошибка при отправке заказа на сервер:', err);
		});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.getItemsList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
