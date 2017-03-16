export default function combine ( ...methods ) {
  return function ( ...args ) {
    for ( var i in methods ) {
      methods[i].apply( this, args )
    }
  }
}
