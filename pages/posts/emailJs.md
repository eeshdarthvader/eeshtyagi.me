---
title: Send Email using EmailJS and React form
date: 2019/5/28
description: A Guide to create a ContactUs form in React.js 
tag: web development
author: You
---

Send Email using EmailJS and React form
=======================================

![](https://miro.medium.com/max/1400/1*WyXuy5rROCKyLpVA5mZPpw.png)Contact Us React Component

This posts will guide you through creating a ContactUs form in React.js and sending mail using third-party service [EmailJS](https://www.emailjs.com/).

**Client**
==========

Let's create a new file in your react codebase `ContactUs.js`

We will be using `reactstrap` to build the Contact Form in react.

`yarn add reactstrap`

Include `import ‘bootstrap/dist/css/bootstrap.min.css’` in your entry file of react ( [See the documentation](https://reactstrap.github.io/))

> Add ‘emailJs’ dependency using yarn or npm.

`yarn add emailjs-com --dev`

### ContactUs.js

```
import React, { Component } from 'react'
**import \* as emailjs from 'emailjs-com'**import Layout from '../components/layout'**import { Button, FormFeedback, Form, FormGroup, Label, Input } from 'reactstrap'**class ContactForm extends Component {
  state = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }handleSubmit(e) {
    e.preventDefault() const { name, email, subject, message } = this.state let templateParams = {
      from\_name: email,
      to\_name: '**<YOUR\_EMAIL\_ID>**',
      subject: subject,
      message\_html: message,
     } **emailjs.send(
      'gmail',
      'template\_XXXXXXXX',
       templateParams,
      'user\_XXXXXXXXXXXXXXXXXXXX'
     )** this.resetForm()
 }resetForm() {
    this.setState({
      name: '',
      email: '',
      subject: '',
      message: '',
    })
  }handleChange = (param, e) => {
    this.setState({ \[param\]: e.target.value })
  }render() {
    return (
      <>
        <Layout>
          <h1 className="p-heading1">Get in Touch</h1>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormGroup controlId="formBasicEmail">
              <Label className="text-muted">Email address</Label>
              <Input
                type="email"
                name="email"
                value={this.state.email}
                className="text-primary"
                onChange={this.handleChange.bind(this, 'email')}
                placeholder="Enter email"
              />
            </FormGroup><FormGroup controlId="formBasicName">
              <Label className="text-muted">Name</Label>
              <Input
                type="text"
                name="name"
                value={this.state.name}
                className="text-primary"
                onChange={this.handleChange.bind(this, 'name')}
                placeholder="Name"
              />
            </FormGroup><FormGroup controlId="formBasicSubject">
              <Label className="text-muted">Subject</Label>
              <Input
                type="text"
                name="subject"
                className="text-primary"
                value={this.state.subject}
                onChange={this.handleChange.bind(this, 'subject')}
                placeholder="Subject"
              />
            </FormGroup><FormGroup controlId="formBasicMessage">
              <Label className="text-muted">Message</Label>
              <Input
                type="textarea"
                name="message"
                className="text-primary"
                value={this.state.message}
                onChange={this.handleChange.bind(this, 'message')}
              />
            </FormGroup><Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Layout>
      </>
    )
  }
}export default ContactForm
```

Create `onSubmit` handler function for `reactstrap Form element` .

Inside the handler function, you will need to create your template params.

```
let templateParams = {
      from\_name: email,
      to\_name: '**<YOUR\_EMAIL\_ID>**',
      subject: subject,
      message\_html: message,
 }
```

Then use `emailjs` component to send the email. You will need to pass the configuration object in this function.

```
**emailjs.send(
      'gmail',
      'template\_XXXXXXXX',
       templateParams,
      'user\_XXXXXXXXXXXXXXXXXXXX'
 )**
```

1.  The first parameter is your email service provider name. If Gmail then use `gmail` .
2.  The second parameter is the template ID. You will get this from Dashboard of emailJs once registered.

![](https://miro.medium.com/max/1400/1*zSI28Gc_dr7H2GJsHIhC0Q.png)

3\. The third parameter is variable templateParam which we created using entered data in the form.

4\. The last parameter is the User ID in the emailJs dashboard.

![](https://miro.medium.com/max/1400/1*TCY0i6WxZciVk33jP4A2xg.png)

For starting with EmailJs [see the documentation.](https://www.emailjs.com/docs/)