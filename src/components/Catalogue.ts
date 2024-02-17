import { ICatalogueProduct } from '../types';

export class Catalogue {
	catalogueData: ICatalogueProduct[];
	onProductClick: (productId: string) => void;

	constructor(
		catalogueData: ICatalogueProduct[],
		onProductClick: (productId: string) => void
	) {
		this.catalogueData = catalogueData;
		this.onProductClick = onProductClick;
	}

	render(): void {
		const catalogueContainer = document.getElementById('catalogue-container');

		if (!catalogueContainer) {
			console.error('Контейнер для каталога не найден');
			return;
		}

		catalogueContainer.innerHTML = '';

		this.catalogueData.forEach((product) => {
			const template = document.getElementById(
				'card-catalog'
			) as HTMLTemplateElement;
			const productElement = template.content.cloneNode(true) as HTMLElement;

			const categoryElement = productElement.querySelector('.card__category');
			if (categoryElement) categoryElement.textContent = product.category;

			const titleElement = productElement.querySelector('.card__title');
			if (titleElement) titleElement.textContent = product.title;

			const imageElement = productElement.querySelector('.card__image');
			if (imageElement) imageElement.setAttribute('src', product.image);

			const priceElement = productElement.querySelector('.card__price');
			if (priceElement) priceElement.textContent = `${product.price} синапсов`;

			productElement.addEventListener('click', () => {
				this.onProductClick(product.id);
			});

			catalogueContainer.appendChild(productElement);
		});
	}
}
