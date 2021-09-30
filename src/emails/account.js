const sgMail = require('@sendgrid/mail')
//const sendGridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeMail = (email, name)=>{
    sgMail.send({
        to:email,
        from: 'mariamboules98@gmail.com',
        subject:'Welcome to the App !',
        text:`Welcome ${name}! Hope you love our App !`
    })
}

const sendByeByeMail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'mariamboules98@gmail.com',
        subject:'Your account is cancelled !',
        text: `Hello ${name}! Your Account is cancelled do you mind to tell us why ??`
    })
}

module.exports = {
    sendWelcomeMail,
    sendByeByeMail
}