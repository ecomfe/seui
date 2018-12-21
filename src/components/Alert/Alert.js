/**
 * @file Alert(这里的alert后续应当具备和toast相同的能力)
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import {isArray} from 'lodash';
const cx = create('alert');

const ICONS_MAP = {
    success: 'check-circle-o',
    warning: 'exclamation-circle-o',
    info: 'info-circle-o',
    error: 'cross-circle-o',
    prev: 'angle-left',
    next: 'angle-right',
    close: 'cross'
};

const UI_MAP = {
    prev: 'link',
    next: 'link',
    close: 'link primary',
    closeLabel: 'link'
};

export default class Alert extends Component {
    /* eslint-disable max-len */
    static template =
    `<div s-if="open" prop-ui="{{ui}}" class="{{computedClass}}">
        <slot name="content">
            <div class="${cx.getPartClassName('state')}">
                <ui-icon class="${cx.getPartClassName('icon')}" name="{{iconName}}"></ui-icon>
            </div>
            <div s-if="isMultiple" class="{{messageClass}}">
                <slot var-index="index" var-message="message[index]">{{message}}</slot>
            </div>
            <div s-else class="${cx.getPartClassName('message')}">
                <slot var-message="message">{{message}}</slot>
            </div>

            <div class="${cx.getPartClassName('nav')}" s-if="isMultiple">
                <ui-button prop-ui="${UI_MAP.prev}" disabled="{{isFirst}}" on-click="switchMessage(-1)">
                    <ui-icon name="${ICONS_MAP.prev}"></ui-icon>
                </ui-button>
                <span class="${cx.getPartClassName('nav-indicator')}">{{index + 1}}/{{message.length}}</span>
                <ui-button prop-ui="${UI_MAP.next}" disabled="{{isLast}}" on-click="switchMessage(1)">
                    <ui-icon name="${ICONS_MAP.next}"></ui-icon>
                </ui-button>
            </div>

            <div class="${cx.getPartClassName('close')}" s-if="closable">
                <ui-button s-if="closeLabel" class="${cx.getPartClassName('close-label')}" prop-ui="${UI_MAP.close}" on-click="close">{{closeLabel}}</ui-button>
                <ui-button s-else prop-ui="${UI_MAP.closeLabel}" on-click="close">
                    <ui-icon s-if="!closeLabel" name="${ICONS_MAP.close}"></ui-icon>
                </ui-button>
            </div>
        </slot>
    </div>`;
    /* eslint-enable max-len */

    initData() {
        return {
            open: true,
            type: 'success',
            index: 0
        };
    }

    static components = {
        'ui-button': Button,
        'ui-icon': Icon
    }

    static dataTypes = {
        ui: DataTypes.string,
        type: DataTypes.string,
        closeLabel: DataTypes.string,
        message: DataTypes.oneOfType([
            DataTypes.string,
            DataTypes.array
        ]),
        open: DataTypes.bool
    };

    static computed = {
        iconName() {
            let type = this.data.get('type');
            return ICONS_MAP[type];
        },

        isMultiple() {
            let message = this.data.get('message');
            return isArray(message);
        },

        isLast() {
            let index = this.data.get('index');
            let message = this.data.get('message');
            return index >= message.length - 1;
        },

        isFirst() {
            let index = this.data.get('index');
            return index <= 0;
        },

        computedClass() {
            let type = this.data.get('type');
            return classnames(
                cx(this).build(),
                cx.getPartClassName(type)
            );
        },

        messageClass() {
            return classnames(
                cx.getPartClassName('message'),
                cx.getPartClassName('message-multiple')
            );
        }

        /*
        closeClass() {
            return classnames(
                cx.getPartClassName('close'),
                cx.getPartClassName('close-label')
            );
        }
        */

    }

    close() {
        this.data.set('open', false);
        this.fire('close');
    }

    switchMessage(step) {
        let {isLast, isFirst, index} = this.data.get();
        if ((step > 0 && isLast) || (step < 0 && isFirst)) {
            return;
        }
        index = index + step;
        this.data.set('index', index);
    }
}
