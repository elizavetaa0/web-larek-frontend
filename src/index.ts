import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { AppState, CatalogChangeEvent, ProductItem } from './components/AppData';
import { Page } from "./components/Page";
import { Card, ICard } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Modal } from './components/base/Modal';
import { Cart } from './components/base/Cart';
import { ICatalogueProduct, IOrderForm, IOrderResult } from './types';
import { OrderForm } from './components/OrderForm';
import { Success } from './components/base/Success';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
  console.log(eventName, data); 
});

// Шаблоны
const cardCatalogueTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const basketTemplateContent = ensureElement<HTMLTemplateElement>('#basket').content;

const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cart = new Cart(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);

events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new Card('card', cloneTemplate(cardCatalogueTemplate), {
      onClick: () => events.emit('card:select', item)
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

  const card = cardContent.querySelector('.card') as HTMLElement;
  const image = cardContent.querySelector('.card__image') as HTMLImageElement;
  const category = cardContent.querySelector('.card__category') as HTMLElement;
  const title = cardContent.querySelector('.card__title') as HTMLElement;
  const text = cardContent.querySelector('.card__text') as HTMLElement;
  const button = cardContent.querySelector('.card__button') as HTMLButtonElement;
  const price = cardContent.querySelector('.card__price') as HTMLElement;

  image.src = selectedItem.image;
  image.alt = selectedItem.title;
  category.textContent = selectedItem.category;
  title.textContent = selectedItem.title;
  text.textContent = selectedItem.description;
  price.textContent = `${selectedItem.price} синапсов`;

  const isItemInCart = cart.isItemInCart(selectedItem.id);
  if (isItemInCart) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }

  button.addEventListener('click', () => {
    cart.addItem(selectedItem);
    events.emit('basket:open');
  });

  modal.render({ content: cardContent });
  updateCartCounter();
});

const basketButton = document.querySelector('.header__basket');
basketButton.addEventListener('click', () => {
  events.emit('basket:open');
});

events.on('basket:open', () => {
  const basketContent = basketTemplateContent.cloneNode(true) as HTMLElement;
  const basketList = basketContent.querySelector('.basket__list') as HTMLElement;
  updateCartContent(basketList);

  const orderButton = basketContent.querySelector('.basket__button');
  orderButton.addEventListener('click', (evt) => {
      events.emit('order:open'); 
  });

  modal.render({ content: basketContent });

  const cartItems = cart.getCartItems();
  const cartSum = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const sumElement = document.querySelector('.basket__price') as HTMLSpanElement;
  sumElement.innerText = `${cartSum} синапсов`;

  if (cartItems.length === 0) {
    orderButton.setAttribute('disabled', 'true');
  }
});

function updateCartContent(basketList: HTMLElement) {
  basketList.innerHTML = '';

  const cartItems = cart.getCartItems();
  cartItems.forEach(item => {
    const cartItem = cloneTemplate(cardBasketTemplate);
    const title = cartItem.querySelector('.card__title') as HTMLElement;
    const price = cartItem.querySelector('.card__price') as HTMLElement;
    const deleteButton = cartItem.querySelector('.basket__item-delete') as HTMLButtonElement;

    title.textContent = item.title;
    price.textContent = `${item.price} синапсов`;

    deleteButton.addEventListener('click', () => {
      const itemId = item.id;
      cart.removeItem(itemId);
      updateCartCounter();
    });

    basketList.appendChild(cartItem);
  });
  updateCartCounter();


}

events.on('order:open', () => {
  const orderFormContent = order.render({
      address: '',
      email: '', 
      phone: '', 
      valid: false,
      errors: []
  });

  modal.render({ content: orderFormContent });

  const paymentMethodButtons = orderFormContent.querySelectorAll<HTMLInputElement>('input[name="payment-method"]');
  paymentMethodButtons.forEach(button => {
      button.addEventListener('click', () => {
          const selectedMethod = button.value;
          order.togglePaymentButtonStyles(selectedMethod);
          order.updateSubmitButtonState();
      });
  });

  const nextButton = orderFormContent.querySelector('.order__button');
  nextButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    modal.close();
    events.emit('contacts:open');
  });
});

events.on('contacts:open', () => {
  const contactsFormContent = contactsTemplate.content.cloneNode(true) as HTMLElement;

  const emailInput = contactsFormContent.querySelector('input[name="email"]') as HTMLInputElement;
  const phoneInput = contactsFormContent.querySelector('input[name="phone"]') as HTMLInputElement;
  const payButton = contactsFormContent.querySelector('.modal__actions button') as HTMLButtonElement;
  
  emailInput.addEventListener('input', () => {
      updateSubmitButtonState();
  });

  phoneInput.addEventListener('input', () => {
      updateSubmitButtonState();
  });

  function updateSubmitButtonState() {
      const isEmailValid = emailInput.value.trim() !== '';
      const isPhoneValid = phoneInput.value.trim() !== '';
      payButton.disabled = !isEmailValid || !isPhoneValid;
  }
  updateSubmitButtonState();

  modal.render({ content: contactsFormContent });

  payButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    modal.close();
    events.emit('order:submit');
    events.emit('success:open');
  });

});

events.on('success:open', () => {
  const successTemplateContent = ensureElement<HTMLTemplateElement>('#success').content.cloneNode(true) as HTMLElement;

  const cartItems = cart.getCartItems();
  const cartSum = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const descriptionElement = successTemplateContent.querySelector('.order-success__description') as HTMLElement;
  descriptionElement.textContent = `Списано ${cartSum} синапсов`;

  const closeButton = successTemplateContent.querySelector('.order-success__close') as HTMLButtonElement;
  closeButton.addEventListener('click', () => {
    modal.close();
    cart.clearBasket();
    updateCartCounter();
  });

  modal.render({ content: successTemplateContent });
});

events.on('order:submit', () => {
  api.orderItems(appData.order)
      .then((result) => {
          const success = new Success(cloneTemplate(successTemplate), {
              onClick: () => {
                  modal.close();
                  appData.clearBasket();
                  events.emit('order:changed');
              }
          });

          modal.render({
              content: success.render({})
          });
      })
      .catch(err => {
          console.error('Ошибка при отправке заказа на сервер:', err);
      });
});

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});

api.getItemsList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });