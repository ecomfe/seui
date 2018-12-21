/**
 * @file Toast
 * @author zhoumin09
 */
import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon/Base';

const cx = create('toast');

// TODO: 无veui中的update：open事件


export default class Toast extends Component {

    static components = {
        'ui-icon': Icon
    };

    static template = `
        <div class="{{computedClass}}">
            <ui-icon name="{{iconName}}"></ui-icon>
            <span class="${cx.getPartClassName('message')}">{{message}}</span>
        </div>
    `;

    static dataTypes = {
        type: DataTypes.oneOf(['success', 'warning', 'info', 'error']),
        message: DataTypes.string,
        duration: DataTypes.number
    };

    static computed = {
        computedClass() {
            let type = this.data.get('type');
            let enter = this.data.get('transitionState') === 'enter';
            let leave = this.data.get('transitionState') === 'leave';
            return classnames(
                cx(this).addStates({enter, leave}).build(),
                cx.getPartClassName(type)
            );
        },

        iconName() {
            let type = this.data.get('type');
            switch (type) {
                case 'success':
                    return 'check-circle-o';
                    break;
                case 'warning':
                    return 'exclamation-circle-o';
                    break;
                case 'info':
                    return 'info-circle-o';
                    break;
                case 'error':
                    return 'cross-circle-o';
                    break;
                default:
                    return '';
            }
        },

        duration() {
            let duration = this.data.get('duration');
            let defaultDuration = this.data.get('defaultDuration');
            return duration > 0 ? duration : defaultDuration;

            // return 100000;
        }
    };

    initData() {
        return {
            type: 'success',
            defaultDuration: 3000,
            transitionState: 'enter'
        };
    }

    attached() {
        let duration = this.data.get('duration');
        let timer = setTimeout(() => {
            this.data.set('transitionState', 'leave');
            setTimeout(() => this.fire('close'), 100);
        }, duration);

        this.timer = timer;
        this.fire('ready', this.el.offsetHeight);
        this.data.set('transitionState', '');
    }

    disposed() {
        let timer = this.timer;
        if (timer) {
            clearTimeout(timer);
        }
    }
}
