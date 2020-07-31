const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter  =   nodemailer.createTransport({
  service:'gmail',
  auth:{
    user: process.env.USERMAIL,
    pass:  process.env.PASSWORDMAIL,
  }
})
router.post("/", (req, res) => {
  let {name, mail, message} = req.body;
  
  transporter.sendMail({
    from: process.env.USERMAIL,
    to: process.env.MAILTO, 
    subject: "My site contact "+ name +" respond to: "+ mail, 
    text:"from: "+name+" replay to: "+mail +" message: "+ message,
  }).then(res  => {
    console.log(res)
    if (info.response.split(' ')[2] === 'OK' )
    res.status(200).json({message:"se envio con exito"})
  else
    res.status(400).json({message:"lo sentimos no se pudo enviar el mail devido a un error en el servicio"})
  }).catch(err  => {
    res.status(400).json({message: err})
  })
})

module.exports = router; 