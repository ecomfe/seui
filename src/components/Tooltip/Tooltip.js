/**
 * @file Tooltip
 * @author liuchaofan
 */

import san, {Component} from 'san';
import Popover from '../Popover';
import {create} from '../../util/cx';

const cx = create('tooltip');

const FOR_SHORT = {
    'bottom': 'b',
    'top': 't',
    'center': 'c',
    'left': 'l',
    'right': 'r'
};

const OPPOSITE = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
};

const GAP = 8;

// TODO: 无veui中的position  trigger hideDelay custom等属性

export default class Tooltip extends Component {
    static template = `
        <div class="${cx.getPartClassName('wrap')}" prop-ui="{{ui}}">
            <slot name="content"/>
            <ui-popover
                overlayClass="{{overlayClass}}"
                s-ref="popover"
                open="{{realOpen}}"
                anchorOrigin="{{realAnchorOrigin}}"
                targetOrigin="{{realTargetOrigin}}"
                overlayClass="{{overlayClass}}"
                offsetX="{{offsetX}}"
                offsetY="{{offsetY}}"
                isScroll="{{!1}}"
                mode="{{mode}}"
                delay="{{delay}}"
                constraints="{{constraints}}"
                excludeSelf="{{!interactive}}"
                getAnchor="{{getAnchor}}"
                on-close-complete="handleClose">
                <div ui="{{ui}}" class="{{computeClass}}">
                    <div class="${cx.getPartClassName('content')}">
                        <slot/>
                    </div>
                </div>
            </ui-popover>
        </div>
    `;

    static components = {
        'ui-popover': Popover
    };

    static computed = {
        computeClass() {
            return cx(this).build();
        }
    };

    initData() {
        return {
            getAnchor: this.getAnchor.bind(this),
            realAnchorOrigin: 'tc',
            realTargetOrigin: 'bc',
            offsetX: 0,
            offsetY: 0,
            mode: 'click',
            ui: '',
            constraints: [
                {
                    to: 'window',
                    attachment: 'together'
                }
            ],
            interactive: false
        };
    }

    attached() {
        this.resolvePopoverPosition(this.data.get('anchorOrigin'));
        this.watch('anchorOrigin', val => {
            this.resolvePopoverPosition(val);
        });
        this.watch('open', val => {
            console.log('toolip watch', val);
            this.data.set('realOpen', val);
        });
        this.watch('target', val => {
            // this.ref('popover').show();
        });
    }

    handleClose() {
        this.data.set('open', false);
        this.data.set('realOpen', false);
    }

    getAnchor() {
        return this.data.get('target');
    }

    resolvePopoverPosition(position) {
        if (!position) {
            return '';
        }

        let [side, align] = position.split(/\s+/);
        let anchorOrigin;
        let targetOrigin;
        if (side === 'top' || side === 'bottom') {
            anchorOrigin = `${side} ${align || 'center'}`;
            targetOrigin = `${OPPOSITE[side]} ${align || 'center'}`;
        }
        else {
            anchorOrigin = `${align || 'center'} ${side}`;
            targetOrigin = `${align || 'center'} ${OPPOSITE[side]}`;
        }
        anchorOrigin = anchorOrigin.split(/\s+/).map(item => FOR_SHORT[item]).join('');
        targetOrigin = targetOrigin.split(/\s+/).map(item => FOR_SHORT[item]).join('');
        if (anchorOrigin.indexOf('b') > -1 && targetOrigin.indexOf('t') > -1) {
            this.data.set('offsetY', GAP);
            this.data.set('offsetX', 0);
        }
        if (anchorOrigin.indexOf('t') > -1 && targetOrigin.indexOf('b') > -1) {
            this.data.set('offsetY', -1 * GAP);
            this.data.set('offsetX', 0);
        }
        if (anchorOrigin.indexOf('l') > -1 && targetOrigin.indexOf('r') > -1) {
            this.data.set('offsetX', -1 * GAP);
            this.data.set('offsetY', 0);
        }
        if (anchorOrigin.indexOf('r') > -1 && targetOrigin.indexOf('l') > -1) {
            this.data.set('offsetX', GAP);
            this.data.set('offsetY', 0);
        }
        this.data.set('realAnchorOrigin', anchorOrigin);
        this.data.set('realTargetOrigin', targetOrigin);
    }
}
