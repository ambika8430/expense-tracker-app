require("dotenv").config();

const { Cashfree } = require("cashfree-pg");
const { createOrder, updateOrder } = require("./orders");

// ✅ Correct Cashfree Configuration Setup
Cashfree.XClientId = process.env.API_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

console.log(
Cashfree.XClientId,
Cashfree.XClientSecret,
Cashfree.XEnvironment
)

exports.createTransaction = async (req, res, next) => {
    let orderId;
    try {
        const customerId = req.user.id;
        //console.log("customerId", customerId);

        const { orderAmount, customerPhone } = req.body;
        //console.log(orderAmount, customerPhone);

        const orderData = await createOrder({
            orderAmount,
            customerId,
            customerPhone,
            status: "pending"
        });

        if (orderData.success) {
            orderId = orderData.order.id;
            //console.log("orderId", orderId);
        } else {
            throw new Error("Order creation failed in database.");
        }

        const request = {
            "order_amount": 100.00,
            "order_currency": "INR",
            "order_id": `${orderId}`,
            "customer_details": {
                "customer_id": `${customerId}`,
                "customer_phone": `${customerPhone}`
            },
            "order_meta": {
                "return_url": `http://localhost:3001/home.html`,
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": new Date(Date.now() + 60 * 60 * 1000).toISOString()
        };

        // ✅ Correct Cashfree initialization
        const response = await Cashfree.PGCreateOrder("2023-08-01", request)

        await updateOrder({ orderId, status: "success" });

        const data = {
            paymentSessionId: response.data.payment_session_id
        }

        return res.status(200).json(data);
    } catch (error) {
        console.log('Error:', error);
        if (orderId) await updateOrder({ orderId, status: "failed" });
        return res.status(500).json({ error: "Transaction failed" });
    }
};

exports.getPaymentStatus = async(req, res, next) => {
    try{
        const { orderId } = req.body;

        const res = Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        let getOrderRes = await res.data;

        let orderStatus;

        if(getOrderRes.filter(transaction => transaction.payment_status === "SUCCESS").length > 0){
            orderStatus = "Success"
        }else if(getOrderRes.filter(transaction => transaction.payment_status === "PENDING").length > 0){
            orderStatus = "Pending"
        }else{
            orderStatus = "Failure"
        }

        return orderStatus;
    }catch(err){
        console.log(err)
    }
}