import Checkout from '../components/Checkout';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
  const { cartItems } = useCart()

  const subtotal = cartItems?.items?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = (orderData) => {
    console.log('Order Placed:', orderData);

  };

  return (
    <div>
      <Checkout
        cartItems={cartItems?.items || []}
        totalPrice={subtotal || 0}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default CheckoutPage;
