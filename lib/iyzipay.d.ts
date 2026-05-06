declare module 'iyzipay' {
  export interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  type Cb = (err: any, result: any) => void;

  class Iyzipay {
    constructor(opts: IyzipayOptions);

    static LOCALE: { TR: 'tr'; EN: 'en' };
    static CURRENCY: { TRY: 'TRY'; EUR: 'EUR'; USD: 'USD'; GBP: 'GBP' };
    static PAYMENT_GROUP: { PRODUCT: 'PRODUCT'; LISTING: 'LISTING'; SUBSCRIPTION: 'SUBSCRIPTION' };
    static BASKET_ITEM_TYPE: { PHYSICAL: 'PHYSICAL'; VIRTUAL: 'VIRTUAL' };
    static PAYMENT_CHANNEL: { WEB: 'WEB'; MOBILE: 'MOBILE' };

    checkoutFormInitialize: { create(req: any, cb: Cb): void };
    checkoutForm:           { retrieve(req: any, cb: Cb): void };
    payment:                { create(req: any, cb: Cb): void; retrieve(req: any, cb: Cb): void };
    refund:                 { create(req: any, cb: Cb): void };
    cancel:                 { create(req: any, cb: Cb): void };
  }

  export default Iyzipay;
}
