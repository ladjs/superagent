module.exports = reduce

var objectKeys = Object.keys

function reduce(list, iterator, context, accumulator) {
    var keys = objectKeys(list)
        , i = 0

    if (arguments.length === 2) {
        context = this
        accumulator = list[0]
        i = 1
    } else if (arguments.length === 3) {
        accumulator = context
        context = this
    }

    for (var len = keys.length; i < len; i++) {
        var key = keys[i]
            , value = list[key]

        accumulator = iterator.call(context, accumulator, value, key, list)
    }

    return accumulator
}
