import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Product } from '../../shared/product.model';
import * as ProductsActions from '../../store/actions';
import { Observable, Subscription, tap } from 'rxjs';
import { selectCartProducts } from '../../store/selectors';
import { select } from '@ngrx/store';
import { NgForm } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
interface UserInfo {
  name: string;
  email: string;
  contactNumber: number;
  totalCost: number;
}

// Define a nested interface for products
interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
}

// Define the main interface for the order
interface Order {
  userInfo: UserInfo;
  products: OrderProduct[];
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false,
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  elements: StripeElements | null = null;
  paymentProcessing = false;
  paymentError: string | null = null;
  paymentSuccess = false;
  useStripe = true;
  minDate: string;
  maxDate: string;
  expirationDate: string = 'MM/YY';
  isCardFlip: boolean = false;
  cvv: string = 'CVV';
  constructor(
    private store: Store<any>,
    private _OrderService: OrderService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    const currentDate = new Date();

    // Set the min date to the current month and year
    this.minDate = this.formatDate(currentDate);

    // Set the max date to 2 years from the current date
    const maxDate = new Date();
    maxDate.setFullYear(currentDate.getFullYear() + 7);
    this.maxDate = this.formatDate(maxDate);
  }

  isFlipped: boolean = false;
  formattedValue = '#### #### #### ####';
  toggleFlip() {
    this.isFlipped = !this.isFlipped;
  }

  products!: Product[];
  cart = 'CART';
  totalPrice!: number;
  storeSub!: Subscription;
  order!: Order;
  ProductsObrsv$!: Observable<Product[]>;
  userEmail: any;
  cardNumber: any;
  cardHolder: string = '';
  CardMask = '#### #### #### ####';

  ngOnInit(): void {
    this.ProductsObrsv$ = this.store.pipe(select(selectCartProducts));
    this.storeSub = this.ProductsObrsv$.subscribe((cartProducts: Product[]) => {
      this.products = cartProducts;
      console.log(this.products);
      if (this.products !== null) {
        // Loop over the cart products array
        this.getTotalPrice(this.products);
      }
    });
    console.log(this.totalPrice);
    const user = localStorage.getItem('userData');

    if (user) {
      const email = JSON.parse(user).email;
      this.userEmail = email;
      console.log(this.order);
    }
  }

  async ngAfterViewInit() {
    // Initialize Stripe with your publishable key
    // Replace with your actual Stripe publishable key
    this.stripe = await loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

    if (this.stripe && this.useStripe) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
      });

      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        this.cardElement.mount('#card-element');
      }
    }
  }
  getTotalPrice(products: Product[]) {
    this.totalPrice = 0;
    for (let i = 0; i < products.length; i++) {
      this.totalPrice += products[i].price * products[i].unit;
    }
    // this.order.userInfo.totalCost = this.totalPrice;
  }
  onDeleteProduct(product: Product) {
    this.store.dispatch(
      new ProductsActions.deleteCartItemAction([this.cart, product._id])
    );
    this.totalPrice -= product.price * product.unit;
  }
  limitCardNumberLength(event: Event) {
    const input = event.target as HTMLInputElement;

    // Remove all non-digit characters
    // let value = input.value;
    let value = input.value.replace(/\D/g, '');

    // Limit to 16 digits
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    // Format the value in groups of four digits separated by spaces
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    // if (value.length > 5 || value.length < 15 ) {
    //   value = "*"
    // }
    // Format the value with masking
    console.log(value.length);
    console.log(value);

    // Update the model and input field
    this.cardNumber = value;
  }
  async onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    let NewOrder: Order = {
      userInfo: {
        name: form.value.name,
        email: this.userEmail,
        contactNumber: form.value['contact-number'],
        totalCost: this.totalPrice,
      },
      products: [],
    };

    for (let product of this.products) {
      NewOrder.products.push({
        name: product.title,
        quantity: product.unit,
        price: product.price,
      });
    }

    if (this.useStripe && this.stripe && this.cardElement) {
      await this.processStripePayment(NewOrder, form.value.name);
    } else {
      // Traditional card processing (mock)
      console.log(NewOrder);
      this._OrderService.createOrder(NewOrder);
      this.paymentSuccess = true;
    }
  }

  async processStripePayment(order: Order, cardholderName: string) {
    this.paymentProcessing = true;
    this.paymentError = null;

    if (!this.stripe || !this.cardElement) {
      this.paymentError = 'Stripe not initialized';
      this.paymentProcessing = false;
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: cardholderName,
          email: order.userInfo.email,
        },
      });

      if (error) {
        this.paymentError = error.message || 'Payment failed';
        this.paymentProcessing = false;
        return;
      }

      // In a real application, send paymentMethod.id to your backend
      // to create a payment intent and confirm the payment
      console.log('Payment Method Created:', paymentMethod);
      console.log('Order:', order);

      // Mock successful payment
      setTimeout(() => {
        this._OrderService.createOrder(order);
        this.paymentSuccess = true;
        this.paymentProcessing = false;
      }, 1500);
    } catch (err: any) {
      this.paymentError = err.message || 'An error occurred during payment';
      this.paymentProcessing = false;
    }
  }

  togglePaymentMethod() {
    this.useStripe = !this.useStripe;
    this.paymentError = null;
    this.paymentSuccess = false;
  }
  onCardNumberFocus() {
    const element = this.el.nativeElement.querySelector('.card-item__focus');
    const targetElement =
      this.el.nativeElement.querySelector('.card .card-number');
    // Define the padding you want to apply
    const paddingX = 30; // horizontal padding (left + right)
    const paddingY = 15; // vertical padding (top + bottom)
    // Get the dimensions of the target element
    const rect = targetElement.getBoundingClientRect();
    // Add padding to the calculated width and height
    const widthWithPadding = rect.width + paddingX;
    const heightWithPadding = rect.height + paddingY;
    this.renderer.addClass(element, 'focus-active');
    this.renderer.setStyle(element, 'width', `${widthWithPadding}px`);
    this.renderer.setStyle(element, 'height', `${heightWithPadding}px`);
    this.renderer.setStyle(
      element,
      'transform',
      'translateX(68px) translateY(72px)'
    );
  }
  onCardHolderFocus() {
    const element = this.el.nativeElement.querySelector('.card-item__focus');
    const targetElement = this.el.nativeElement.querySelector(
      '.card .card-holder-wrapper'
    );
    // Define the padding you want to apply
    const paddingX = 0; // horizontal padding (left + right)
    const paddingY = 0; // vertical padding (top + bottom)
    // Get the dimensions of the target element
    const rect = targetElement.getBoundingClientRect();
    // Add padding to the calculated width and height
    const widthWithPadding = rect.width + paddingX;
    const heightWithPadding = rect.height + paddingY;
    this.renderer.addClass(element, 'focus-active');
    this.renderer.setStyle(element, 'width', `${widthWithPadding}px`);
    this.renderer.setStyle(element, 'height', `${heightWithPadding}px`);
    this.renderer.setStyle(
      element,
      'transform',
      'translateX(5px) translateY(133px)'
    );
  }
  onExpirationDateFocus() {
    const element = this.el.nativeElement.querySelector('.card-item__focus');
    const targetElement = this.el.nativeElement.querySelector(
      '.card .date-wrapper'
    );
    // Define the padding you want to apply
    const paddingX = 20; // horizontal padding (left + right)
    const paddingY = 0; // vertical padding (top + bottom)
    // Get the dimensions of the target element
    const rect = targetElement.getBoundingClientRect();
    // Add padding to the calculated width and height
    const widthWithPadding = rect.width + paddingX;
    const heightWithPadding = rect.height + paddingY;
    this.renderer.addClass(element, 'focus-active');
    this.renderer.setStyle(element, 'width', `${widthWithPadding}px`);
    this.renderer.setStyle(element, 'height', `${heightWithPadding}px`);
    this.renderer.setStyle(
      element,
      'transform',
      'translateX(287px) translateY(133px)'
    );
  }

  dateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Split the input string by '-'
    const [year, month] = input.value.split('-');
    // Return the formatted string as MM/YY
    this.expirationDate = `${month}/${year.slice(2)}`;
    console.log(`${month}/${year.slice(2)}`);
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
  cvvInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cvv = input.value;
  }
  onFocus() {
    this.isCardFlip = true;
  }

  onBlur() {
    this.isCardFlip = false;
  }
  getCardStyle() {
    return {
      transform: this.isCardFlip ? 'rotateY(-180deg)' : 'rotateY(0deg)',
      transition: 'transform 0.6s',
    };
  }
  ngOnDestroy() {
    this.storeSub.unsubscribe();
  }
}
