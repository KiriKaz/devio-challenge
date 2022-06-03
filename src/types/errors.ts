export class CustomError extends Error {
  statusCode: number
  message: string
  options?: any
  
  constructor(statusCode: number, message: string, ...options: any[]) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.options = options;
  }
}

interface INotFoundError {
  object: string,
  statusCode: 404
}

interface IInputError {
  fieldName: string
}

interface IRequirementError {
  requirementsUnmet: string[]
}

interface IInternalError {
  tryAgain: boolean,
  statusCode: 500
}

/*****************************/

const errorMessages = {
  ClientNotFound: "CLIENT_NOT_FOUND",
  ProductNotFound: "PRODUCT_NOT_FOUND",
  OrderNotFound: "ORDER_NOT_FOUND",
  CartEmpty: "CART_EMPTY",
  OrderComplete: "ORDER_COMPLETE",
  ProductNotInCart: "PRODUCT_NOT_IN_CART",
  UnknownOperation: "UNKNOWN_OPERATION",
  UnknownError: "UNKNOWN_ERROR",
}


export class ClientNotFound extends CustomError implements INotFoundError {
  object: string;
  statusCode: 404;

  constructor() {
    super(404, errorMessages.ClientNotFound);
    this.statusCode = 404;
    this.object = "client";
  }
}

export class ProductNotFound extends CustomError implements INotFoundError {
  object: string;
  statusCode: 404;

  constructor() {
    super(404, errorMessages.ProductNotFound);
    this.statusCode = 404;
    this.object = "product";
  }
}

export class OrderNotFound extends CustomError implements INotFoundError {
  object: string;
  statusCode: 404;

  constructor() {
    super(404, errorMessages.OrderNotFound);
    this.statusCode = 404;
    this.object = "order";
  }
}

export class UnknownOperation extends CustomError implements IInputError {
  fieldName: string;
  
  constructor() {
    super(400, errorMessages.UnknownOperation);
    this.fieldName = "op"
  }
}

export class CartEmpty extends CustomError implements IRequirementError {
  requirementsUnmet: string[];

  constructor() {
    super(400, errorMessages.CartEmpty);
    this.requirementsUnmet = [ "cartNotEmpty" ];
  }
}

export class OrderComplete extends CustomError implements IRequirementError {
  requirementsUnmet: string[];

  constructor() {
    super(400, errorMessages.OrderComplete);
    this.requirementsUnmet = [ "orderIncomplete" ];
  }
}

export class ProductNotInCart extends CustomError implements IRequirementError {
  requirementsUnmet: string[];

  constructor() {
    super(400, errorMessages.ProductNotInCart);
    this.requirementsUnmet = [ "productInCart" ];
  }
}

export class UnknownError extends CustomError implements IInternalError {
  statusCode: 500;
  tryAgain: boolean;

  constructor(retry: boolean, error: any) {
    super(500, errorMessages.UnknownError, { error });
    this.statusCode = 500;
    this.tryAgain = retry;
  }
}