/**
 * @file convert object to css string
 */
import {css} from './css';
import {create} from './cx';

const RE_NUMBER = /^(?:\d*(?:\.\d+)?|\.\d+)$/;
export function normalizeLength(val) {
    if (!val) {
        return null;
    }
    if ((typeof val === 'number' || RE_NUMBER.test(val))) {
        return Number(val) > 0 ? `${val}px` : null;
    }
    return val;
}

export {
    css,
    create
};
