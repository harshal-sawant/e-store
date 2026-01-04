import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../../shared/product.model';
import { Comment } from '../interfaces/comment.model';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  of,
  tap,
} from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // Change import statement
import { map, takeUntil } from 'rxjs/operators';
import { BaseComponent } from 'global/base/base.component';

@Injectable({
  providedIn: 'root',
})
export class RequestsService extends BaseComponent {
  private isCartToggleSubject = new Subject<boolean>();
  private isCartOpenSubject = new BehaviorSubject<boolean>(false);
  private totalPriceSubject = new BehaviorSubject<number>(0);
  private cartLengthSubject = new BehaviorSubject<number>(0);
  private wishlistLengthSubject = new BehaviorSubject<number>(0);

  cartLength$ = this.cartLengthSubject.asObservable();
  wishlistLength$ = this.wishlistLengthSubject.asObservable();

  itemsNumbers$ = combineLatest([this.cartLength$, this.wishlistLength$]);
  isCartOpen$ = this.isCartOpenSubject;
  totalPrice$ = this.totalPriceSubject;
  isCartToggle$ = this.isCartToggleSubject;
  wishlist = 'WICHLIST';
  cart = 'CART';
  products: Product[] = [];
  dbWishlist: Product[] = [];
  dbCart: Product[] = [];
  wishlistLen!: number;
  uid: string | undefined;
  constructor(private http: HttpClient) {
    super();
    // Safe JSON parsing with error handling
    const jsonString = localStorage.getItem('userData');
    if (jsonString) {
      try {
        const parsedData = JSON.parse(jsonString);
        this.uid = parsedData.uid;
      } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
      }
    }
    this.getWishlist()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        data == null ? (this.dbWishlist = []) : (this.dbWishlist = data);
        this.wishlistLengthSubject.next(this.dbWishlist.length);
      });
    this.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        data == null ? (this.dbCart = []) : (this.dbCart = data);
        this.cartLengthSubject.next(data.length);
      });
  }

  getDbCart(): Observable<Product[]> {
    return this.getCart().pipe(
      tap((data) => {
        data ?? [];
        this.cartLengthSubject.next(data.length);
      })
    );
  }

  getAll(
    search?: string,
    category?: string,
    sortOption?: string,
    numericFilter?: string,
    limit?: number
  ) {
    let apiUrl: string = `http://localhost:5000/api/v1/products`;
    let sign = '?';
    if (search) {
      apiUrl = apiUrl + `${sign}search=${search}`;
      sign = '&';
    }
    if (category) {
      apiUrl = apiUrl + `${sign}category=${category}`;
      sign = '&';
    }
    if (sortOption) {
      apiUrl = apiUrl + `${sign}sort=${sortOption}`;
      sign = '&';
    }
    if (numericFilter) {
      apiUrl = apiUrl + `${sign}numericFilter=${numericFilter}`;
      sign = '&';
    }
    if (limit) {
      apiUrl = apiUrl + `${sign}limit=${limit}`;
    }
    return this.http.get<{ success: boolean; data: Product[] }>(apiUrl).pipe(
      map((res) => {
        const products: Product[] = res.data.map((product) => {
          return { ...product, unit: 1 };
        });
        return products;
      })
    );
  }

  getProduct(productId: number) {
    return this.http.get(`http://localhost:5000/api/v1/products/${productId}`);
  }
  updateProducts(products: Product[]) {
    return this.http.put<any>(
      `http://localhost:5000/api/v1/users/${this.uid}/cart`,
      products
    );
  }
  getAllCategories() {
    return this.http
      .get<{ success: boolean; data: Product[] }>(
        `http://localhost:5000/api/v1/categories`
      )
      .pipe(map((res) => res.data));
  }

  addNewCategory(category: string) {
    return this.http.post<any>(`http://localhost:5000/api/v1/categories`, {
      category: category,
    });
  }

  getCategory(category: string, sortOption?: string, numericFilter?: string) {
    let apiUrl: string = `http://localhost:5000/api/v1/products?category=${category}`;
    if (sortOption) {
      apiUrl = apiUrl + `&sort=${sortOption}`;
    }
    if (numericFilter) {
      apiUrl = apiUrl + `&numericFilter=${numericFilter}`;
    }
    return this.http
      .get<{ success: boolean; data: Product[] }>(apiUrl)
      .pipe(map((res) => res.data));
  }

  createOrder(body: any) {
    this.http
      .post<any>('http://localhost:5000/api/v1/orders', body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {},
        (err) => {}
      );
  }

  addToWishlist(product: Product) {
    this.dbWishlist = removeDuplicates(this.dbWishlist, product);
    this.wishlistLengthSubject.next(this.dbWishlist.length);
    return this.http.put<Product[]>(
      `http://localhost:5000/${this.uid}/wishlist.json`,
      this.dbWishlist
    );
  }
  getWishlist() {
    return this.http.get<Product[]>(
      `http://localhost:5000/api/v1/users/${this.uid}/wishlist`
    );
  }
  addToCart(product: Product) {
    let list!: Product[];
    this.dbCart = removeDuplicates(this.dbCart, product);
    this.cartLengthSubject.next(this.dbCart.length);

    return this.http.put<Product[]>(
      `http://localhost:5000/api/v1/users/${this.uid}/cart`,
      this.dbCart
    );
  }
  getCart() {
    return this.http.get<Product[]>(
      `http://localhost:5000/api/v1/users/${this.uid}/cart`
    );
  }
  draft: any = [];
  removeCartItem(id: number) {
    this.draft.push(id);
    let listName = 'cart';
    if (this.dbCart) {
      for (let removeId of this.draft) {
        this.dbCart = this.dbCart.filter((p: Product) => p._id !== removeId);
      }
      this.cartLengthSubject.next(this.dbCart.length);
    }
    return this.http.put<Product[]>(
      `http://localhost:5000/${this.uid}/${listName}.json`,
      this.dbCart
    );
  }
  removeWishItem(id: number) {
    this.draft.push(id);
    let listName = 'wishlist';
    if (this.dbWishlist) {
      for (let removeId of this.draft) {
        this.dbWishlist = this.dbWishlist.filter(
          (p: Product) => p._id !== removeId
        );
      }
      this.wishlistLengthSubject.next(this.dbWishlist.length);
    }
    return this.http.put<Product[]>(
      `http://localhost:5000/${this.uid}/${listName}.json`,
      this.dbWishlist
    );
  }
  getComments(productID: any) {
    return this.http.get<any>(
      `http://localhost:5000/api/v1/comments/${productID}`
    );
  }
  getOneComment(productID: any, uid: any) {
    return this.http.get<any>(
      `http://localhost:5000/api/v1/comments/${productID}/${uid}`
    );
  }
  saveComment(productID: string, body: any): Observable<any> {
    localStorage.setItem('commentExists', 'true');
    return this.http.post<any>(
      `http://localhost:5000/api/v1/comments/${productID}`,
      body
    );
  }

  updateComment(productID: any, uid: any, body: any) {
    return this.http.put<any>(
      `http://localhost:5000/api/v1/comments/${productID}/${uid}`,
      body
    );
  }
}

export function removeDuplicates(array: any, product: Product): Product[] {
  const index = array.findIndex((p: any) => p._id === product._id);

  if (index !== -1) {
    const modifiedProduct: Product = {
      ...array[index],
      unit: (array[index].unit || 1) + 1,
    };
    array[index] = modifiedProduct;
    return [...array];
  }

  return [...array, { ...product, unit: 1 }];
}
