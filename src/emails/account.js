const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SOURCE_EMAIL,
        subject: 'Thanks for joining in!',
        text: `Welcome to the Taskrr, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SOURCE_EMAIL,
        subject: 'Thank you for being with us!',
        html: "</p>Hello, "+name+".</p><br><br></p>Thank you for being with us during this time. We are open to know why you decided to cancel your account, than we can improve our app and our services.</p><br><p>Sincerely,<br>Taskrr CEO</p>"
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}



