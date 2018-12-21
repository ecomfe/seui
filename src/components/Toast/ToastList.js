/**
 * @file ToastList
 * @author zhoumin09
 */
import {Component, DataTypes} from 'san';
import {findIndex, uniqueId} from 'lodash';
import {create} from '../../util/cx';

import Toast from './Toast';

const cx = create('toastlist');

export default class ToastList extends Component {
    static components = {
        'ui-toast': Toast
    };

    static template = `
        <div class="{{computedClassName}}">
            <ui-toast san-for="message, index in messages"
                type="{{message.type}}"
                message="{{message.message}}"
                duration="{{message.duration}}"
                style="top: {{message.top}}px;"
                on-close="remove(message)"
                on-ready="updateHeight(message, index, $event)">
            </ui-toast>
        </div>
    `;

    static dataTypes = {
        messages: DataTypes.array
    };

    static computed = {
        computedClassName() {
            return cx(this)
                .build();
        }
    };

    initData() {
        return {
            type: 'toastlist',
            messages: []
        };
    }

    attached() {
    }

    // add message, add uniqueId to index each item
    add(message) {
        let indexedMessage = Object.assign({height: 0, top: 0}, message, {
            messageId: uniqueId('dux-toast-')
        });
        this.data.unshift('messages', indexedMessage);
        return indexedMessage;
    }

    remove(message) {
        let messages = this.data.get('messages');
        let index = findIndex(messages, msg => {
            return msg.messageId === message.messageId;
        });
        this.data.removeAt('messages', index);
        this.updateLayout();
    }

    updateHeight(message, index, height) {
        this.data.set(`messages[${index}].height`, height);
        this.updateLayout();
    }

    updateLayout() {
        let messages = this.data.get('messages');
        for (let index = 0; index < messages.length; index++) {
            if (index === 0) {
                this.data.set('messages[0].top', 0);
            }
            else {
                let prev = this.data.get(`messages[${index - 1}]`);
                let top = prev.top + prev.height + 10;
                this.data.set(`messages[${index}].top`, top);
            }
        }
    }
}
