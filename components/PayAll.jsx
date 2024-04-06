'use client'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function PayAll() {
    const products = useSelector((state) => state.cart.products);

    const [totalPrice, setTotalPrice] = useState(0);
    function calculateTotalPrice() {
        let t = 0;
        for (let i = 0; i < products.length; i++) {
            const obj = products[i];
            const count = obj.count;
            const price = obj.product.price * count;
            t = t+price;
            
        }
        setTotalPrice(t);
    }
    const [paypalButtonKey, setPaypalButtonKey] = useState(0); // Key for re-rendering PayPal button
    const [paypalButton, setPaypalButton] = useState(null);

    useEffect(() => {
        calculateTotalPrice()
    }, [products]);

    useEffect(() => {
        //console.log(totalPrice);

        // Define createOrder function inside useEffect to capture updated price
        const createOrderFunction = (data, actions) => {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: totalPrice.toFixed(2)
                        },
                    },
                ],
            });
        };

        // Remove existing PayPal button and re-add with updated createOrder function
        setPaypalButtonKey(prevKey => prevKey + 1);

        setPaypalButton(
            <PayPalButtons
                key={paypalButtonKey}
                style={{ layout: "horizontal" }}
                createOrder={createOrderFunction}
                onApprove={(data, actions) => {
                    return actions.order.capture().then(function (details) {
                        toast.success(
                            'Payment successful, thank you ' + details.payer.name.given_name,
                            { duration: 5000 }
                        );
                    });
                }}
                onCancel={() => toast(
                    'You cancelled the payment',
                    {
                        icon: '🚫',
                        duration: 5000
                    }
                )}
                onError={() => toast.error(
                    'An error occurred with your payment, please try again',
                    { duration: 5000 }
                )}
            />
        );
    }, [totalPrice]);

    return (
        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_CLIENT_ID }}>
            {paypalButton}
            <Toaster />
        </PayPalScriptProvider>
    );
}
