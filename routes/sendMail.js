const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const env = require("dotenv")

const transporter  =   nodemailer.createTransport({
  service:'gmail',
  auth:{
    user: process.env.USERMAIL,
    pass:  process.env.PASSWORDMAIL,
  }
})
router.post("/", async (req, res) => {
  let {name, mail, message} = req.body;
  
  let info = await transporter.sendMail({
    from: process.env.USERMAIL,
    to: process.env.MAILTO, 
    subject: "My site contact from :"+ name +" respond to: "+ mail, 
    text: message,
  });
  /*if(info.response.split(' ')[2] === 'OK' )
    res.status(200).json({message:"se envio con exito"})
  else*/
    res.status(400).json({message:"lo sentimos no se pudo enviar el mail devido a un error en el servicio"})
  });

module.exports = router; 