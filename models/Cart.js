// ODM (Object Data Mapping library)
const mongoose = require('mongoose');

//========================================
// Define our Schema
const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number
            }
        }
    ]
},{timestamps: true }
);// to add time of creating and updating the document (cart)

module.exports = mongoose.model("Cart", CartSchema);