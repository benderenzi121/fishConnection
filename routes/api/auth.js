const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
//  middlewear to authenticate the json web token
const auth = require('../../middleware/auth')

const User = require('../../models/User')
//  @route GET       api/auth
//  @description     gets info on user if they have a token
//  @access          Public

//  auth is custom middlewear validation that validates whether the user
//  has a token or not
router.get('/', auth, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).status('send server error');
    }
})


//  @route           POST api/auth
//  @description     verify user + get token
//  @access          Public
router.post(
    '/',   
    [   //checks to see if the request attempted has the data it needs
        check('email', 'please include a valid email').isEmail(),
        check('password', 'password is required' ).exists()
    ],

async (req,res) => { 
    const  errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const { email, password } = req.body;

    try{
        
        let user = await User.findOne({ email })

        if (!user){
            res.status(400).json({errors: [{msg: 'Invalid Credentials' }] });
        }
    
        //  bcrypt compare compares a plaintext password to a hashed one
        //  returns a boolean value of whether the strings matched.
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res
            .status(400)
            .json({errors: [{msg: 'Invalid Credentials' }] });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
            )
   
        

    } catch(err){
        console.error(err);
        res.status(500).send('server error');
    }
    
});
module.exports = router;