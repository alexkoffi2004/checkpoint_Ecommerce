const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    deliveryInstructions: { type: String }
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['orange', 'moov', 'mtn', 'wave']
  },
  trackingNumber: { type: String },
  notes: { type: String },
  adminUpdatedAt: { type: Date },
  deliveryConfirmation: {
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.pre('save', function(next) { 
  this.updatedAt = new Date(); 
  next(); 
});

module.exports = mongoose.model('Order', orderSchema); 