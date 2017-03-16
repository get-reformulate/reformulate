import IntlError from 'intl-error'

const NUMBER = /^[0-9]*$/

export default function () {
  return function ( value ) {
    if ( ! value ) return
    if ( typeof value == 'string' && ! value.match( NUMBER ) ) {
      throw new IntlError({ id: "reformulate.validate_number_invalid" })
    }
  }
}
