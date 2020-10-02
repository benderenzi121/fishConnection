const mongoose = require('mongoose')


const ProfileSchema = new mongoose.Schema({
    
    user:     {
        type: mongoose.SchemaTypes.ObjectId, 
        ref: 'user'
    },

    location: {
        type: String
    },

    skills:   {
        type: [String],
        required: true
    },

    gear:     {
        type: [String]
    },
    
    baits:     {
        type: [String]
    },


})