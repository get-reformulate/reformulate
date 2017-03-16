import IntlError from 'intl-error'

export default function ( minDate ) {
  minDate = (
    minDate instanceof Date && minDate ||
    new Date( minDate )
  )

  if ( isNaN ( minDate ) ) {
    throw new Error( "minDate should be a valid date" )
  }

  return ( value ) => {
    if ( ! value ) return

    const date = (
      value instanceof Date && value ||
      new Date( value )
    )

    if ( isNaN( date ) ) {
      throw new IntlError({ id: "reform.validate_date_invalid" })
    }

    if ( date < minDate ) {
      throw new IntlError({ id: "reform.validate_min_date" }, { date: minDate.toString() })
    }
  }
}
