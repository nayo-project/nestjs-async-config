import * as _ from 'lodash';
/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 * @rel https://gist.github.com/Yimiprod/7ee176597fef230d1451
 */
export function differenceObject(object, base) {
    return _.transform(object, (result, value, key) => {
        if (!_.isEqual(value, base[key])) {
            result[key] = (_.isObject(value) && _.isObject(base[key])) ? differenceObject(value, base[key]) : value;
        }
    });
}
