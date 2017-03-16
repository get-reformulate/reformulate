import IntlError from 'intl-error'

export default function ( chars = 20 ) {
  return function ( value ) {
    if ( typeof value == 'string' && value.length > chars ) {
      throw new IntlError({ id: "reform.validate_max_length" }, { chars })
    }
  }
}
