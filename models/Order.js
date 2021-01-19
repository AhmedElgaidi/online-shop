// ODM (Object Data Mapping library)
const mongoose = require('mongoose');
const { schema } = require('./Product');

//========================================
// Define our Schema
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            product: { type: Object, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: {
        name: {
            type: String,
            required: true
        },
        // Create a relation
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);