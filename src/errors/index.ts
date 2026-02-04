export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "./custom-errors";

export {
  OrderNotFoundError,
  InvalidOrderItemError,
  ProductNotAvailableError,
  InvalidQuantityError,
  OrderAlreadyPaidError,
  PaymentRequiredError,
  OrderCannotBeCancelledError,
  OrderAlreadyCancelledError,
  EmptyOrderError,
  InvalidOrderStatusError,
} from "../modules/orders/errors/order.errors";

export {
  PaymentNotFoundError,
  PaymentAlreadyExistsError,
  MercadoPagoError,
  InvalidPaymentMethodError,
  PaymentAmountMismatchError,
  PaymentExpiredError,
  PaymentRefundError,
  PaymentProcessingError,
} from "../modules/payments/errors/payment.errors";

export {
  ProductNotFoundError,
  InvalidPriceError,
  InvalidProductDataError,
} from "../modules/products/errors/products.errors";

export {
  AddonNotFoundError,
  AddonAlreadyExistsError,
  InvalidAddonPriceError,
  InvalidAddonNameError,
  ProductRequiredForAddonError,
  AddonPermissionDeniedError,
} from "../modules/addons/errors/addon.errors";

export {
  UserNotFoundError,
  UserEmailNotFoundError,
  UserAlreadyExistsError,
  InvalidUserDataError,
  InvalidEmailError,
  InvalidPasswordError,
  InvalidPhoneError,
  UserUnauthorizedError,
  UserForbiddenError,
  TokenInvalidError,
  TokenMissingError,
} from "../modules/users/errors/user.errors";

export {
  InvalidCredentialsError,
  AccountNotActivatedError,
  AccountLockedError,
  SessionExpiredError,
  RefreshTokenInvalidError,
  EmailAlreadyVerifiedError,
  VerificationTokenInvalidError,
  PasswordResetTokenInvalidError,
  OAuthProviderError,
} from "../modules/auth/errors/auth.errors";

export {
  AddressNotFoundError,
  InvalidCepError,
  InvalidAddressDataError,
  AddressLimitReachedError,
  AddressPermissionDeniedError,
  MainAddressRequiredError,
  DeliveryAddressNotFoundError,
} from "../modules/addresses/errors/address.errors";

export {
  CategoryNotFoundError,
  CategoryAlreadyExistsError,
  InvalidCategoryDataError,
  CategoryInUseError,
  CategoryPermissionDeniedError,
} from "../modules/categories/errors/category.errors";

export {
  DeliveryFeeNotFoundError,
  DeliveryFeeAlreadyExistsError,
  InvalidDeliveryFeeError,
  InvalidDeliveryDataError,
  DeliveryZoneNotCoveredError,
  MinimumOrderValueError,
  DeliveryTimeSlotNotAvailableError,
} from "../modules/delivery/errors/delivery.errors";

export {
  StoreNotFoundError,
  StoreAlreadyExistsError,
  InvalidStoreDataError,
  StoreClosedError,
  OutsideBusinessHoursError,
  StoreMaintenanceError,
  StorePermissionDeniedError,
} from "../modules/store/errors/store.errors";
