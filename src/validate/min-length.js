import IntlError from 'intl-error'

export default function ( chars = 5 ) {
  return function ( value ) {
    if ( typeof value == 'string' && value.length > 0 && value.length < chars ) {
      throw new IntlError({ id: "reformulate.validate_min_length" }, { chars })
    }
  }
}
