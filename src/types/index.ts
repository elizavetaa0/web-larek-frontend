declare const API_ORIGIN: string;

interface ICatalogue {
  total: number;
  items: ICatalogueItem;
}

interface ICatalogueItem {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

interface IProduct {
  description: string;
  image: string;
  title: string;
  category:  string;
  price: number;
}

interface IPayment {
  address: string;
}

interface IContacts {
  email: string;
  phone: string;
}

interface IOrderResult extends IProduct {
	id: string;
  total: number;
}





