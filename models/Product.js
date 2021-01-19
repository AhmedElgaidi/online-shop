// ODM (Object Data Mapping library)
const mongoose = require('mongoose');

//===========================================
// Define User Schema
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        // Let's create a relation with another model
        type: Schema.Types.ObjectId,
        // It tells mongoose which other mongoose model we want to relate
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})// to add the live time for making or updating the document(User).


//============================================================
// Let's create a model based on our product schema
module.exports = mongoose.model('Product', productSchema);
// The model must be singular
// because mongoose adds 's' on it's own to it and creates it in our db collections.