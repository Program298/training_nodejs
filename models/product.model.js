const mogoose = require('mongoose')
const Schema = mogoose.Schema


const productSchema = new Schema({
    Product_name: {
        type: String,
        required: true
    },
    Max_order: {
        type: Number,
        required: true
    },
    Order: {
        type: [

            {
                time: {
                    type: Date,
                    default: Date.now
                },
                User_id: {
                    type: String,
                    required: true
                }
            },

        ],
        validate: {
            validator: function (value) {
                return value.length <= this.Max_order;
            },
            message: 'Order exceeds Max_order limit'
        }
    },
    Price: {
        type: Number, required: true
    }
})

module.exports = mogoose.model('Product', productSchema, 'Product')