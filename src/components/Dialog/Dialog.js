/**
 * @file Dialog
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import DragHandler from '../../managers/Drag/DragHandler';
import Layer from '../Popover/Layer';
const cx = create('dialog');

export default class Dialog extends Layer {
    static template = `
        <div class="{{computedClass}}" prop-ui="{{ui}}" style="{{mainStyle}}">
            <div class="${cx.getPartClassName('content')}"
                s-ref="content">
                <div class="{{headClass}}" s-ref="head">
                    <span class="${cx.getPartClassName('content-head-title')}">
                        <slot name="title">{{title}}</slot>
                    </span>
                    <a class="${cx.getPartClassName('content-head-close')}"
                        s-if="closable"
                        on-click="hide">
                        <ui-icon name="cross"></ui-icon>
                    </a>
                </div>
                <div class="${cx.getPartClassName('content-body')}"><slot></slot></div>
                <div class="${cx.getPartClassName('content-foot')}">
                  <slot name="foot">
                      <ui-button ui="primary" on-click="handleConfirm">确定</ui-button>
                      <ui-button on-click="handleCancel">取消</ui-button>
                  </slot>
                </div>
            </div>
        </div>
    `;

    static components = {
        'ui-icon': Icon,
        'ui-button': Button
    };

    static dataTypes = {
        open: DataTypes.bool,
        modal: DataTypes.bool,
        draggable: DataTypes.bool,
        closable: DataTypes.bool
    };

    static computed = {
        mainStyle() {
            return this.data.get('open') ? {display: 'block'} : {display: 'none'};
        },

        computedClass() {
            let modal = this.data.get('modal');
            return classnames(
                cx.getPartClassName('box'),
                {[cx.getPartClassName('box-mask')]: modal}
            );
        },

        headClass() {
            let draggable = this.data.get('draggable');
            return classnames(
                cx.getPartClassName('content-head'),
                {[cx.getPartClassName('draggable')]: draggable}
            );
        }
    };

    initData() {
        return {
            open: false,
            draggable: false,
            modal: false,
            closable: true
        };
    }

    attached() {
        super.attached && super.attached();
        let draggable = this.data.get('draggable');
        if (draggable) {
            this.dragHandler = new DragHandler(this, {containment: 'window'});
            this.dragHandler.init();
        }
    }

    reset() {
        let draggable = this.data.get('draggable');
        if (!draggable) {
            return;
        }
        this.dragHandler.reset();
    }

    detached() {
        this.dragHandler && this.dragHandler.destroy();
        super.detached && super.detached();
    }

    handleConfirm() {
        this.fire('ok');
    }

    hide() {
        this.data.set('open', false);
        this.fire('close');
    }

    handleCancel() {
        this.fire('cancel');
    }
}
