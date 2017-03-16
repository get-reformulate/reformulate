import IntlError from 'intl-error'

const PHONE = /^(\+[1-9]{1}[0-9]{7,12}|)$/

export default function () {
  return function ( value ) {
    if ( ! value ) return
    if ( typeof value == 'string' && ! value.match( PHONE ) ) {
      throw new IntlError({ id: "reformulate.validate_phone_invalid" })
    }
  }
}
