# reformulate
react-intl/intl compatible error

Handle better your forms, add reformulate to your webapp.

## Installation
```bash
yarn add reformulate
```

## Usage

```javascript
import ptReformulateLocaleData from 'reformulate/build/locale/pt'
import enReformulateLocaleData from 'reformulate/build/locale/en'

// merge locale messages into yours
// Example:

export default {
  ...enReformulateLocaleData,
  'my.nice.message': 'YOLO'
}
```

```javascript
import React, { Component } from 'react'
import { Form, validate } from 'reformulate'
import { Input, SubmitButton } from 'reformulate-semantic-ui'

export default class LoginComponent extends Component {
  render () {
    const { onSubmit } = this
    return (
      <Form onSubmit={onSubmit}>
        <Input name='username'
          validate={validate.combine(
            validate.notEmpty(),
            validate.maxLength( 255 )
          )}
        />

        <Input name='password' type='password'
          validate={validate.combine(
            validate.notEmpty(),
            validate.maxLength( 255 )
          )}
        />

        <SubmitButton />
      </Form>
    )
  }

  onSubmit = async ( values ) => {
    // ...
  }
}

```
