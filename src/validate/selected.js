import IntlError from 'intl-error'

export default function ( min = 1, max = Infinity ) {
  return function ( value ) {
    console.log( 'eval', value )
    if ( (value === null || value === '') && min > 0 ) {
      throw new IntlError({ id: "reform.validate_selected_ensure" })
    }

    if ( Array.isArray( value ) && value.length < min ) {
      throw new IntlError({ id: "reform.validate_selected_min" }, { min })
    }

    if ( Array.isArray( value ) && value.length > max ) {
      throw new IntlError({ id: "reform.validate_selected_max" }, { max })
    }
  }
}