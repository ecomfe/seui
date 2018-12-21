/**
 * @file SpecialDialog
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import Icon from '../Icon';
import Button from '../Button';
import Dialog from './Dialog';
const cx = create('alert-box');

const ICONS_MAP = {
    success: 'check-circle-o-large',
    info: 'info-circle-o-large',
    error: 'cross-circle-o-large'
};

export default class SpeicalDialog extends Component {
    static template = `
        <div>
            <ui-dialog class="{{computedClass}}" open="{=open=}" closable="{{closable}}" prop-ui="{{type}}">
                <div class="${cx.getPartClassName('body-wrap')}">
                    <ui-icon class="${cx.getPartClassName('icon')}" name="{{iconName}}"></ui-icon>
                    <h3 class="${cx.getPartClassName('title')}">{{title}}</h3>
                    <div class="${cx.getPartClassName('content')}">{{content}}</div>
                </div>
                <div slot="foot">
                    <ui-button on-click="ok">知道了</ui-button>
                </div>
            </ui-dialog>
        </div>
    `;

    static dataTypes = {
        type: DataTypes.oneOf(['error', 'success', 'info']),
        open: DataTypes.bool
    };

    static computed = {
        computedClass() {
            return cx(this).build();
        },
        iconName() {
            let type = this.data.get('type');
            return ICONS_MAP[type];
        }
    };

    static components = {
        'ui-icon': Icon,
        'ui-button': Button,
        'ui-dialog': Dialog
    };

    open(title, content) {
        this.data.set('title', title);
        this.data.set('content', content);
        this.data.set('open', true);
    }

    close() {
        this.data.set('open', false);
    }

    ok() {
        this.fire('ok');
    }
}
