import IntlError from 'intl-error'

const EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi

export default function () {
  return function ( value ) {
    if ( ! value ) return
    if ( typeof value == 'string' && ! value.match( EMAIL ) ) {
      throw new IntlError({ id: "reform.validate_email_invalid" })
    }
  }
}
