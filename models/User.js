// ODM (Object Data Mapping library)
const mongoose = require('mongoose');

//========================================
// Define our Schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
}, { timestamps: true })// to add time of adding/ updating the document (user)

//=====================================================
// Let's add some custom function (methods)
// (1) addToCart
userSchema.methods.addToCart = function(product) {
    // let's get product index
    const cartProductIndex = this.cart.items.findIndex(cb => {
        return cb.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push( {
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

// (2) removeFromCart
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        // i removed return statement
        item.productId.toString() !== productId.toString();
    });
    this.cart = updatedCartItems;
    return this.save();
};

// (3) clearCart
userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
};

// Let's export our created model (based on our user schema)
module.exports = mongoose.model('User', userSchema);