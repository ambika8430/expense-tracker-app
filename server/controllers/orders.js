const Order = require("../models/order");

// Function to create an order
exports.createOrder = async ({ customerId, orderAmount, customerPhone, status }) => {
    try {
        if (!customerId) throw new Error("Unauthorized: User ID is missing");

        // Ensure the amount is a valid number
        const parsedAmount = parseFloat(orderAmount);
        if (isNaN(parsedAmount)) throw new Error("Invalid amount");

        // Check if an order with the same customerId exists
        let existingOrder = await Order.findOne({ where: { customerId, status: "pending" } });
        if (existingOrder){
            return { success: true, order: existingOrder };
        }

        const newOrder = await Order.create({ 
            amount: parsedAmount, 
            customerId, 
            customerPhone, 
            status 
        });

        console.log("Created New Order");
        return { success: true, order: newOrder };

    } catch (err) {
        console.error("Error creating order:", err.message);
        return { success: false, error: err.message };
    }
};

// Function to update an order
exports.updateOrder = async ({ orderId, status }) => {
    try {
        let order = await Order.findOne({ where: { id: orderId } });
        if (!order) throw new Error("Order not found");

        // Update status if provided
        if (status !== undefined) {
            order.status = status;
            await order.save();
        }

        console.log("Updated Order");
        return { success: true, order };

    } catch (err) {
        console.error("Error updating order:", err.message);
        return { success: false, error: err.message };
    }
};

// Function to get an order by orderId or customerId
exports.isPremium = async(req,res) => {
    try {
        customerId = req.user.id

        if (!customerId) throw new Error("Order ID or Customer ID is required");

        const order = await Order.findOne({ where: {customerId, status:"success"} });

        console.log(order)

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        res.status(200).json({ success: true, message:"customer has premium" });
    } catch (err) {
        console.error("Error fetching order:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

