declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      'client:only'?: any;
      'client:load'?: any;
      'client:idle'?: any;
      'client:visible'?: any;
      'client:media'?: any;
    }
  }
}

export {};
