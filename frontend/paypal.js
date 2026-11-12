

const API_BASE_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", async () => {

    const amountInput = document.getElementById("paymentAmount");
    const buttonContainer = document.getElementById("paypal-button-container");
    const paymentMessage = document.getElementById("paymentMessage");

    if (!amountInput || !buttonContainer || !paymentMessage) {
        console.error("PayPal payment elements not found.");
        return;
    }

    function showMessage(message, success = false) {
        paymentMessage.hidden = false;
        paymentMessage.textContent = message;
        paymentMessage.style.color = success ? "green" : "red";
    }

    try {

        // Get PayPal Client ID
        const configResponse = await fetch(
            `${API_BASE_URL}/paypal-config`
        );

        if (!configResponse.ok) {
            throw new Error("Unable to load PayPal configuration.");
        }

        const config = await configResponse.json();

        // Load PayPal JavaScript SDK
        const paypalScript = document.createElement("script");

        paypalScript.src =
            `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.client_id)}&currency=${encodeURIComponent(config.currency)}&intent=capture`;

        paypalScript.onload = () => {

            paypal.Buttons({

                // Create Order
                createOrder: async () => {

                    const amount = Number(amountInput.value);

                    if (!Number.isFinite(amount) || amount <= 0) {
                        showMessage("Please enter a valid payment amount.");
                        throw new Error("Invalid payment amount.");
                    }

                    if (!/^\d+(\.\d{1,2})?$/.test(amountInput.value.trim())) {
                        showMessage("Enter an amount with up to 2 decimal places.");
                        throw new Error("Invalid amount format.");
                    }

                    const response = await fetch(
                        `${API_BASE_URL}/create-paypal-order`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                amount: amount,
                                currency: config.currency
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok || !data.order?.id) {
                        throw new Error("PayPal order creation failed.");
                    }

                    showMessage("PayPal order created. Continue checkout.", true);

                    return data.order.id;
                },

                // Capture Payment After Approval
                onApprove: async (data) => {

                    showMessage("Processing payment...");

                    const response = await fetch(
                        `${API_BASE_URL}/capture-paypal-order`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                order_id: data.orderID
                            })
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error("Payment capture failed.");
                    }

                    const payment = result.payment;

                    if (payment.status !== "COMPLETED") {
                        throw new Error("Payment is not confirmed.");
                    }

                    // Get Capture Details
                    const capture =
                        payment.purchase_units?.[0]?.payments?.captures?.[0];

                    if (!capture?.amount?.value) {
                        throw new Error("Payment details not found.");
                    }

                    // Create Payment Record
                    const paymentRecord = {
                        orderId: data.orderID,
                        amount: capture.amount.value,
                        currency: capture.amount.currency_code,
                        status: payment.status,
                        date: new Date().toISOString()
                    };

                    // Get Existing Payment Records
                    const paymentRecords = JSON.parse(
                        localStorage.getItem("ds_payments") || "[]"
                    );

                    // Avoid Duplicate Records
                    const alreadySaved = paymentRecords.some(
                        record => record.orderId === data.orderID
                    );

                    if (!alreadySaved) {
                        paymentRecords.push(paymentRecord);

                        localStorage.setItem(
                            "ds_payments",
                            JSON.stringify(paymentRecords)
                        );
                    }

                    showMessage(
                        `Payment Successful! Order ID: ${data.orderID}`,
                        true
                    );
                },

                // Cancel Payment
                onCancel: () => {
                    showMessage("Payment cancelled by user.");
                },

                // Handle Errors
                onError: (error) => {
                    console.error("PayPal Error:", error);
                    showMessage("Payment failed. Please try again.");
                }

            }).render("#paypal-button-container");

        };

        paypalScript.onerror = () => {
            showMessage("Unable to load PayPal Checkout.");
        };

        document.head.appendChild(paypalScript);

    } catch (error) {

        console.error("PayPal Setup Error:", error);
        showMessage(error.message || "PayPal setup failed.");

    }

});
