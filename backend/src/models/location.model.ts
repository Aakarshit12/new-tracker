import mongoose, { Document } from 'mongoose';

export interface ILocation extends Document {
  user: mongoose.Schema.Types.ObjectId;
  order: mongoose.Schema.Types.ObjectId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

const Location = mongoose.model<ILocation>('Location', locationSchema);

export default Location;
