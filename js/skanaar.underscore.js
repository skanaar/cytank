;(function (){
    function randomName(syllables){
        var vowel = 'aaeeiioouuy'
        var conso = 'bcddfghhkllmnnprrsstttv'
        function syllable(){ return _.sample(vowel) + _.sample(conso) }
        return _.sample(conso).toUpperCase() + 
                _.times(syllables || _.random(2,4), syllable).join('')
    }
    function pluckerFunction(plucker){
        return {
            'undefined': _.identity,
            'string': function (obj){ return obj[plucker] },
            'number': function (obj){ return obj[plucker] },
            'function': plucker
        }[typeof plucker]
    }
    function rangeOf(list, plucker){
        var transform = pluckerFunction(plucker)
        for(var i=0, min=Infinity, max=-Infinity, len=list.length; i<len; i++){
            min = Math.min(min, +transform(list[i]))
            max = Math.max(max, +transform(list[i]))
        }
        return { min: min, max: max }
    }
    function sum(list, plucker){
        var transform = pluckerFunction(plucker)
        for(var i=0, s=0, len=list.length; i<len; i++)
            s += +transform(list[i])
        return s
    }
    function average(list, plucker){
        return sum(list, plucker) / list.length
    }
    function format(template /* variadic params */){
        var parts = Array.prototype.slice.call(arguments, 1)
        return _.flatten(_.zip(template.split('#'), parts)).join('')
    }
    function prune(list, predicate){
        for(var i=0; i<list.length; i++)
            if (predicate(list[i]))
                list.splice(i, 1)
    }

    _.mixin({
        sum: sum,
        average: average,
        rangeOf: rangeOf,
        randomName: randomName,
        format: format,
        prune: prune
    })
}())
