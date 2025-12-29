declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
      'client:only'?: any;
      'client:load'?: any;
      'client:idle'?: any;
      'client:visible'?: any;
      'client:media'?: any;
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

export {};
