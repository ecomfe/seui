/**
 * @file Select
 * @author liuchaofan
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import bytes from 'bytes';
const cx = create('uploader-progress');

function convertSizeUnit(size) {
    return bytes(size, {decimalPlaces: 1});
}

export default class ProgressBar extends Component {
    static template = `
        <div class="{{computedClass}}">
            <slot s-if="type === 'text'"></slot>
            <template s-if="type === 'number'">{{showNumber}}</template>
            <template s-if="type === 'bar'">
                <div class="${cx.getPartClassName('bar')}" style="width: {{percent || '0%'}}"></div>
                <div class="${cx.getPartClassName('bar-full')}"></div>
            </template>
        </div>
    `;

    static computed = {
        computedClass() {
            return classnames(
                cx(this).build()
            );
        },
        percent() {
            let loaded = this.data.get('loaded') || 0;
            let total = this.data.get('total') || 0;
            if (total) {
                return Math.ceil((loaded) / total * 100) + '%';
            }
            return '0%';
        },
        showNumber() {
            let percent = this.data.get('percent');
            let loaded = this.data.get('loaded');
            let total = this.data.get('total');
            if (percent && loaded && total) {
                return `${percent} ${convertSizeUnit(loaded)}/${convertSizeUnit(total)}`;
            }
        }
    };
}