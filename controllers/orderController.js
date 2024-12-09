
import orderModel from "../models/orderModel.js";
import userModel from "../models/orderModel.js"
import Razorpay from 'razorpay';




//set razorpay 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


// placing user order from frontend
const placeOrder = async (req,res) => {

    // const frontend_url = "http://localhost:5173"
  
    try {
      const {userId, items, amount, address} =req.body;


      // Save the order in the database
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

        // Create Razorpay Order
      const options = {
        amount: amount *84*100, // Amount in paise (INR), use original amount if conversion is not needed
        currency: "INR",
        receipt: `order_${newOrder._id}`,
        payment_capture: 1,
      };
  
      const razorpayOrder = await razorpay.orders.create(options);
  
      // Send the Razorpay Order ID to the frontend for payment
      res.json({
        success: true,
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount, // Send original amount instead of recalculating
        key: process.env.RAZORPAY_KEY_ID, // Send public key to frontend
      });
    } catch (error) {
      console.error("Error placing the order:", error);
      res.status(500).json({ success: false, message: "Error placing the order" });
    }
  };
  
  // Verify Payment and Update Order
  const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
      if (success === "true") {
        await orderModel.findByIdAndUpdate(orderId, { payment: true });
        res.json({ success: true, message: "Payment successful. Order has been updated." });
      } else {
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: false, message: "Payment failed. Order has been canceled." });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ success: false, message: "Error processing payment" });
    }
  }


export {placeOrder,verifyOrder};