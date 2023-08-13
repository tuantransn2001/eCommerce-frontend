/* eslint-disable import/extensions */
import { useGet } from '@/customizes/hooks';
import Image from 'next/image';
import { CHECKOUT_FORM_DATA } from '@/data/checkout';
import { Address, CartItem, Payment } from '@/domain/common';
import { cartSelector } from '@/redux/slice/cart.slice';
import { API_PATH, RESPONSE_STATUS } from '@/ts/enums/api_enums';
import { useSelector } from 'react-redux';
import FormController from '../helpers/FormController';
import LoadingScreen from '../helpers/LoadingScreen';
import Page from '../helpers/Page';
import './style/Checkout.scss';
import { handleCalcCartTotal } from '@/common';
import { useState } from 'react';
import { CreateOrderDTO } from '@/ts/dto/common.dto';
import MyButton from '../helpers/MyButton';
import { BUTTON_SIZE, BUTTON_TYPE, HREF } from '@/ts/enums/common';
import { createOrderDeepChecker } from '@/ts/utils/dataDeepChecker';
import { userSelector } from '@/redux/slice/auth.slice';
import OrderService from '@/services/order.service';
import { ObjectType } from '@/ts/types/common';
import MyModal from '../helpers/Modal';
import { useRouter } from 'next/router';

const PAYMENT_ICON: Record<number, JSX.Element> = {
  [0]: <i className="bx bx-credit-card d-block h2 mb-3" />,
  [1]: <i className="bx bxl-paypal d-block h2 mb-3" />,
  [2]: <i className="bx bx-money d-block h2 mb-3" />,
};

const SUBMIT_MODAL_DATA: ObjectType = {
  success: {
    message: 'Your order has been created',
    nextActionContent: 'Continue shopping',
  },
  fail: {
    message: 'Something went wrong. Please try again!',
    nextActionContent: 'Try again',
  },
};

const Checkout = () => {
  const router = useRouter();
  const cartData = useSelector(cartSelector);
  const userData = useSelector(userSelector);
  const [orderDispatchData, setOrderDispatchData] = useState<
    Partial<CreateOrderDTO>
  >({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [reqRes, setReqRes] = useState<string>('fail');

  const handlePopupModelSuccess = () => {
    setReqRes('success');
    setIsOpen(true);
  };
  const handlePopupModelFail = () => {
    setReqRes('fail');
    setIsOpen(false);
  };

  const handleOnSubmitCreateOrder = async () => {
    const { value, error } = createOrderDeepChecker({
      ...orderDispatchData,
      user_id: userData?.id,
      cart_id: cartData?.id,
    });

    if (error) {
      handlePopupModelFail();
    } else {
      const createUserOrderResult = await OrderService.createUserOrder(
        value as CreateOrderDTO,
      );
      if (createUserOrderResult.status === RESPONSE_STATUS.SUCCESS) {
        handlePopupModelSuccess();
      }
      if (createUserOrderResult.status === RESPONSE_STATUS.FAIL) {
        handlePopupModelFail();
      }
    }
  };

  const { data: paymentMethods, isLoading: isGetPaymentMethodsLoading } =
    useGet(API_PATH.getAllPaymentMethod, {
      page_number: 1,
      page_size: 5,
    });

  const { data: addressesData, isLoading: isGetUserAddressLoading } = useGet(
    API_PATH.getUserAddress,
    {
      id: userData?.id,
      page_number: 1,
      page_size: 5,
    },
  );

  const renderPaymentMethod = () => {
    return (
      <div>
        <h5 className="font-size-14 mb-3">Payment method :</h5>
        <div className="row">
          {paymentMethods.data?.map((paymentMethod: Payment, index: number) => {
            return (
              <div className="col-lg-3 col-sm-6" key={index}>
                <div data-bs-toggle="collapse">
                  <label className="card-radio-label">
                    <input
                      type="radio"
                      name="pay-method"
                      id={paymentMethod.id}
                      className="card-radio-input"
                      onChange={() => {
                        setOrderDispatchData((prev) => ({
                          ...prev,
                          payment_id: paymentMethod.id,
                        }));
                      }}
                    />
                    <span className="card-radio py-3 text-center text-truncate">
                      {PAYMENT_ICON[index]}
                      {paymentMethod.title}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCartItems = () => {
    return (
      cartData &&
      cartData?.products?.map((item: CartItem, index: number) => {
        return (
          <tr key={index}>
            <th scope="row">
              <Image
                src={item.imgSrc}
                alt={item.name}
                width={200}
                height={200}
                title="product-img"
                className="avatar-lg rounded"
              />
            </th>
            <td>
              <h5 className="font-size-16 text-truncate">
                <span className="text-dark">{item.name}</span>
              </h5>
              <p className="text-muted mb-0">
                <i className="bx bxs-star text-warning" />
                <i className="bx bxs-star text-warning" />
                <i className="bx bxs-star text-warning" />
                <i className="bx bxs-star text-warning" />
                <i className="bx bxs-star-half text-warning" />
              </p>
              <p className="text-muted mb-0 mt-1">
                $ {item.price} x {item.quantity}
              </p>
            </td>
            <td>$ {handleCalcCartTotal(cartData)}</td>
          </tr>
        );
      })
    );
  };

  const renderUserAddresses = () => {
    return addressesData.data?.map((address: Address, index: number) => {
      return (
        <div className="col-lg-4 col-sm-6" key={index}>
          <div data-bs-toggle="collapse">
            <label className="card-radio-label mb-0">
              <input
                type="radio"
                name="address"
                id={address.id}
                className="card-radio-input"
                defaultChecked={false}
                onChange={() => {
                  setOrderDispatchData((prev) => ({
                    ...prev,
                    address_id: address.id,
                  }));
                }}
              />
              <div className="card-radio text-truncate p-3">
                <span className="fs-14 mb-4 d-block">Address {index + 1}</span>
                <span className="fs-14 mb-2 d-block">{address.country}</span>
                <span className="text-muted fw-normal text-wrap mb-1 d-block">
                  {address.address}
                </span>
                <span className="text-muted fw-normal d-block">
                  {address.postalCode}
                </span>
              </div>
            </label>
            <div className="edit-btn bg-light rounded">
              <span
                data-bs-toggle="tooltip"
                data-placement="top"
                title=""
                data-bs-original-title="Edit"
              >
                <i className="bx bx-pencil font-size-16" />
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return isGetPaymentMethodsLoading || isGetUserAddressLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <MyModal
        isOpen={isOpen}
        type={reqRes}
        message={SUBMIT_MODAL_DATA[reqRes].message}
        nextActionContent={SUBMIT_MODAL_DATA[reqRes].nextActionContent}
        handleOnSwitchNextAction={() => router.push(HREF.home)}
        handleOnClose={() => setIsOpen(false)}
      />

      <Page title="Checkout">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <div className="card">
                <div className="card-body">
                  <ol className="activity-checkout mb-0 px-4 mt-3">
                    <li className="checkout-item">
                      <div className="avatar checkout-icon p-1">
                        <div className="avatar-title rounded-circle bg-primary">
                          <i className="bx bxs-receipt text-white font-size-20" />
                        </div>
                      </div>
                      <div className="feed-item-list">
                        <div>
                          <h5 className="font-size-16 mb-1">Billing Info</h5>
                          <p className="text-muted text-truncate mb-4">
                            Sed ut perspiciatis unde omnis iste
                          </p>
                          <div className="mb-3">
                            <FormController
                              data={CHECKOUT_FORM_DATA}
                              isLoading={false}
                              onSubmit={(checkoutData) => {
                                console.log(checkoutData);
                                // TODO: Create address -> call api
                              }}
                              submitAction={'Checkout'}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="checkout-item">
                      <div className="avatar checkout-icon p-1">
                        <div className="avatar-title rounded-circle bg-primary">
                          <i className="bx bxs-truck text-white font-size-20" />
                        </div>
                      </div>
                      <div className="feed-item-list">
                        <div>
                          <h5 className="font-size-16 mb-1">Shipping Info</h5>
                          <p className="text-muted text-truncate mb-4">
                            Neque porro quisquam est
                          </p>
                          <div className="mb-3">
                            <div className="row">{renderUserAddresses()}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="checkout-item">
                      <div className="avatar checkout-icon p-1">
                        <div className="avatar-title rounded-circle bg-primary">
                          <i className="bx bxs-wallet-alt text-white font-size-20" />
                        </div>
                      </div>
                      <div className="feed-item-list">
                        <div>
                          <h5 className="font-size-16 mb-1">Payment Info</h5>
                          <p className="text-muted text-truncate mb-4">
                            Duis arcu tortor, suscipit eget
                          </p>
                        </div>
                        {renderPaymentMethod()}
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
              <div className="row my-4">
                <div className="col">
                  <MyButton
                    transparent
                    size={BUTTON_SIZE.lg}
                    type={BUTTON_TYPE.primary}
                    href={HREF.home}
                    className="btn btn-link text-muted"
                  >
                    <i className="mdi mdi-arrow-left me-1" /> Continue Shopping
                  </MyButton>
                </div>
                <div className="col">
                  <div className="text-end mt-2 mt-sm-0">
                    <MyButton
                      className="btn btn-success"
                      type={BUTTON_TYPE.primary}
                      onClick={handleOnSubmitCreateOrder}
                    >
                      <i className="mdi mdi-cart-outline me-1" /> Procced
                    </MyButton>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="card checkout-order-summary">
                <div className="card-body">
                  <div className="p-3 bg-light mb-3">
                    <h5 className="font-size-16 mb-0">
                      Order Summary{' '}
                      <span className="float-end ms-2">#MN0124</span>
                    </h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-centered mb-0 table-nowrap">
                      <thead>
                        <tr>
                          <th
                            className="border-top-0"
                            style={{ width: 110 }}
                            scope="col"
                          >
                            Product
                          </th>
                          <th className="border-top-0" scope="col">
                            Product Desc
                          </th>
                          <th className="border-top-0" scope="col">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderCartItems()}
                        <tr>
                          <td colSpan={2}>
                            <h5 className="font-size-14 m-0">Sub Total :</h5>
                          </td>
                          <td>$ {handleCalcCartTotal(cartData)}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <h5 className="font-size-14 m-0">Discount :</h5>
                          </td>
                          <td>- $ 0</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <h5 className="font-size-14 m-0">
                              Shipping Charge :
                            </h5>
                          </td>
                          <td>$ 0</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <h5 className="font-size-14 m-0">
                              Estimated Tax :
                            </h5>
                          </td>
                          <td>$ 0</td>
                        </tr>
                        <tr className="bg-light">
                          <td colSpan={2}>
                            <h5 className="font-size-14 m-0">Total:</h5>
                          </td>
                          <td>$ {handleCalcCartTotal(cartData)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  );
};

export default Checkout;
