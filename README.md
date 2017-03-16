<img width="100%" alt="captura de ecra 2017-03-16 as 15 33 17" src="https://cloud.githubusercontent.com/assets/3604053/24004385/22eea1c4-0a5e-11e7-989c-fdf3757bda2a.png">

# reformulate
react forms engine to help you out building forms with react

## Installation
```bash
yarn add reformulate reformulate-your-ui
```

## Developed UIs so far
reformulate itself doesn't handle UI binding, it is only the Form/Fields engine.
You must add a UI binding package to your project that matches the UI you're using.
If you don't find it here, feel free to make yours and PR a link.

* [Semantic UI](https://github.com/get-reformulate/reformulate-semantic-ui)


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
